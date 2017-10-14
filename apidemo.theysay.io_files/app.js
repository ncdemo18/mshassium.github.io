var baseURL = '/api/v1/';

var entityTypeImages = {
  "COMPANY":                  "organisation",
  "ENTITY":                   "entity",
  "LOCATION":                 "location",
  "LOCATION.CITY":            "location",
  "LOCATION.STATE":           "location",
  "LOCATION.COUNTRY":         "location",
  "MONEY":                    "money",
  "ORGANISATION":             "organisation",
  "ORGANISATION.COMPANY":     "organisation",
  "ORGANISATION.GOVERNMENT":  "government",
  "ORGANISATION.PARTY":       "organisation",
  "OTHER":                    "other",
  "PEOPLE":                   "people",
  "TIMEDATE":                 "timedate"
}

var preCeiveMixin = {
  methods: {
    post: function(endpoint, payload,success) {
        var self=this;
        return new Promise(function(resolve, reject) {
        self.pendingRequests++;
        $.ajax({
          url: baseURL + endpoint,
          type: "POST",
          data: JSON.stringify(payload),
          dataType: "json",
          contentType: "application/json",
          async: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          success: function(s) { resolve(s); self.pendingRequests--;},
          error: function(e) { reject(e);self.pendingRequests--; }
        }).then(success);
      });
    }
  }

};

var docSentimentScoreCardComponent = Vue.extend({
  props: ['posScore', 'ntrScore', 'negScore', 'confidence'],
  template: '#doc-sentiment-score-template',
  methods: {
    pctToOpacity: function(pct) {
      if (pct === 0) { return 0.05; }
      else { return pct; }
    }
  }
});

var sentimentGradientBarComponent = Vue.extend({
  props: ['positive', 'neutral', 'negative', 'majority'],
  template: '#sentiment-gradient-bar-template'
});

var emotionBarChartComponent = Vue.extend({
  props: ['emotions', 'minScore', 'maxScore'],
  template: '#emotion-bar-chart-template',
    methods: {

      to1DEmotionURL: function(dimension, score) {
        var label = this.to1DEmotionLabel(dimension, score);
        var url = 'img/emotion/emotion-' + label.toLowerCase() + '-face' + '-1' + '.jpeg';

        return url;
      },

    to1DEmotionLabel: function(dimension, score) {
      if (dimension === "anger1D")                { return "ANGER"; }
      if (dimension === "calm2D" && score >= 0)   { return "CALMNESS"; }
      if (dimension === "calm2D" && score < 0)    { return "AGITATION"; }
      if (dimension === "fear1D")                 { return "FEAR" }
      if (dimension === "happy2D" && score >= 0)  { return "HAPPINESS"; }
      if (dimension === "happy2D" && score < 0)   { return "SADNESS"; }
      if (dimension === "like2D" && score >= 0)   { return "LIKING"; }
      if (dimension === "like2D" && score < 0)    { return "DISLIKING"; }
      if (dimension === "shame1D")                { return "SHAME"; }
      if (dimension === "sure2D" && score >= 0)   { return "CERTAINTY"; }
      if (dimension === "sure2D" && score < 0)    { return "DOUBT"; }
      if (dimension === "surprise1D")             { return "SURPRISE"; }

      return dimension;
    },

    toEmotionColor: function(dimension, score) {
      if (dimension === "anger1D")                { return "anger-color"; }
      if (dimension === "calm2D" && score >= 0)   { return "calmness-color"; }
      if (dimension === "calm2D" && score < 0)    { return "agitation-color"; }
      if (dimension === "fear1D")                 { return "fear-color"; }
      if (dimension === "happy2D" && score >= 0)  { return "happiness-color"; }
      if (dimension === "happy2D" && score < 0)   { return "sadness-color"; }
      if (dimension === "like2D" && score >= 0)   { return "liking-color"; }
      if (dimension === "like2D" && score < 0)    { return "disliking-color"; }
      if (dimension === "shame1D")                { return "shame-color"; }
      if (dimension === "sure2D" && score >= 0)   { return "certainty-color"; }
      if (dimension === "sure2D" && score < 0)    { return "doubt-color"; }
      if (dimension === "surprise1D")             { return "surprise-color"; }

      return "";
    },

    toEmotionBarHeight: function(score, max) {
      if (score === 0) { return 0 + 'px'; }

      var height = score * 75;

      if (height > max) {
        return max + 'px';
      } else {
        var scale = height / max;
        return (max * scale) + 'px';
      }
    },

    toEmotionOpacity: function(score, max) {
      if (score === 0) { return 0; }

      var height = score * 75;

      if (height > max) { return 1; }
      else { return height / max; }
    }
  }
});


var vm = new Vue({
    mixins: [preCeiveMixin],
    components: {
      'doc-sentiment-score': docSentimentScoreCardComponent,
      'sentiment-gradient-bar': sentimentGradientBarComponent,
      'doc-emotion-bar-chart' : emotionBarChartComponent
    },
    el: '#app',
    data: {
      pendingRequests:0,
      preceive: {
        document: {
          emotion: {},
          sentiment: {
            sentiment: {
              confidence: 0,
              label: "",
              neutral: 0,
              negative: 0,
              positive: 0,
            }
          },
          topic: {}
        },
        entities: {
          sentiment: {}
        },
        namedEntities: {},
        sentences: {
          emotion: {},
          intent: {},
          sentiment: {},
          speculation: {}
        },
        syntax: {
          chunkParse: {},
          depParse: {},
          posTag: {}
        }
      },
      rawText: ""
    },
    computed: {
		status:function() {
			var self=this;
	       return {
			   'fa-refresh'     : self.pendingRequests==0,
			   'fa-spinner'     : self.pendingRequests!=0,
			   'fa-pulse'       : self.pendingRequests!=0
		   };
        }
	},
    methods: {
       received:function() {
           this.pendingRequests--;
       },
      callPreCeive: function() {
        var self = this;
        var text = self.rawText;
          self.post('depparsefull', { "text": text }).then(function(r) { self.preceive.syntax.depParse = r; });
        self.post('emotion',        { "text": text, "level": "sentence" },function(r) { self.preceive.sentences.emotion = r; });
        self.post('emotion',        { "text": text },function(r) { self.preceive.document.emotion = r; });
        self.post('intent',         { "text": text },function(r) { self.preceive.sentences.intent = r; });
        self.post('namedentity',    { "text": text },function(r) { self.preceive.namedEntities = r; });
        self.post('postag',         { "text": text },function(r) { self.preceive.syntax.posTag = r; });
        self.post('risk',           { "text": text },function(r) { self.preceive.sentences.risk = r; });
        self.post('sentiment',      { "text": text, "level": "entity" },function(r) { self.preceive.entities.sentiment = r; });
        self.post('sentiment',      { "text": text, "level": "sentence" },function(r) { self.preceive.sentences.sentiment = r; });
        self.post('sentiment',      { "text": text },function(r) { self.preceive.document.sentiment = r; });
        self.post('speculation',    { "text": text },function(r) { self.preceive.sentences.speculation = r; });
        self.post('topic',          { "text": text },function(r) { self.preceive.document.topic = r; });
      },

      toNamedEntityLabelGroups: function(entities) {
        var self=this;
        var groups= _.groupBy(entities, function(e) {
          return e.namedEntityTypes;
        });
        var entityGroups=_.map(groups,function(values,key) {
			if (!entityTypeImages[key]) console.log(key);
            return {
               entities:values,
               key:key,
               label:(key.lastIndexOf('.')>1) ? key.substring(key.lastIndexOf('.')+1) : key,
               icon :'img/ner-' + entityTypeImages[key]+ '.jpg',
               sortKey: (key!="OTHER") ?-values.length : 10000
            };
        }).sort(function(a,b) { return a.sortKey-b.sortKey});

        return entityGroups;
      },

      toEntityPolarityGroups: function(entities) {
        var groups = _.groupBy(entities, function(e) {
          return e.sentiment.label;
        });

        var sorted = _.mapObject(groups, function(val, key) {
          return _.sortBy(val, function(e) {
            return e.sentiment[key.toLowerCase()]
          })
          .reverse();
        });

        return sorted;
      },

      toSentimentBarLabel: function(positive, neutral, negative, majority) {
        switch (majority) {
          case "POSITIVE":  return "POS " + parseFloat(positive).toFixed(1);
          case "NEUTRAL":   return "NTR " + parseFloat(neutral).toFixed(1);
          case "NEGATIVE":  return "NEG " + parseFloat(negative).toFixed(1);
          default:          return "";
        }
      },

      toSortedWords: function(dependencies) {
        return _.sortBy(dependencies, function(d) { return d.dependent.wordIndex; });
      },

      groupByGovernor: function(words) {
        return _.groupBy(words, function (w) {
          if (_.isUndefined(w.governor)) {
            if (w.dependency.relation === "root") {
              return "root";
            } else {
              return -2;
            }
          } else {
            return w.governor.wordIndex;
          }
        });
      },

      printConstituent: function(words) {
        return _.map(words, function(w) { return w.dependent.text; }).join(" ");
      },
      groupBySentenceIndex:function(_elements) {

      var _sentences=[];

          for ( var i=0;i<_elements.length;i++ ) {
          var elem=_elements[i];
              var index=elem.sentenceIndex;
          var current=_sentences[index];

          if (!current) {
          current=[];
          _sentences[index]=current;
          }

          current.push(elem);
      }
        return _sentences;
    },
    toSentenceParse:function(dependencies,posTags) {
        if (_.isEmpty(dependencies)) { return null; }
        var self = this;
        var words= self.toSortedWords(dependencies);
        var _sentences=self.groupBySentenceIndex(words).map(function(sentenceWords) {
        return {
            text: self.printConstituent(sentenceWords),
            parse:self.toParseStack(sentenceWords,posTags)
           };
        });
        return _sentences;
      },
      toParseStack: function(dependencies, posTags) {
        if (_.isEmpty(dependencies)) { return null; }

        var self = this;

        var words = self.toSortedWords(dependencies);
        var constituents = self.groupByGovernor(words);

        var firstWord = _.first(words);
        var lastWord = _.last(words);

        if (_.isUndefined(firstWord.dependent)) { return null; }
        if (_.isUndefined(lastWord.dependent)) { return null; }

        var spans = _.map(words, function(word) {
          var depID =  word.dependent.wordIndex;
          var posTag = word.dependent.posTag;
          var constituentStart;
          var constituentEnd;
          var constituent = constituents[depID];

          if (_.isUndefined(constituent)) {
            constituentStart = word;
            constituentEnd = word;
          } else if (word.dependency.relation === "root") {
            constituentStart = firstWord;
            constituentEnd = lastWord;
          } else {
            constituentStart = _.first(constituent);
            constituentEnd = _.last(constituent);

            if (depID < constituentStart.dependent.wordIndex) { constituentStart = word; }
            if (depID > constituentStart.dependent.wordIndex) { constituentEnd = word; }
          }

          var onsetWords = _.first(_.partition(words, function(w) {
            return (w.dependent.wordIndex < constituentStart.dependent.wordIndex);
          }));

          var nucleusWords = _.first(_.partition(words, function(w) {
            return (
              (w.dependent.wordIndex >= constituentStart.dependent.wordIndex)
              &&
              (w.dependent.wordIndex <= constituentEnd.dependent.wordIndex)
            );
          }));

          var codaWords = _.first(_.partition(words, function(w) {
            return (w.dependent.wordIndex > constituentEnd.dependent.wordIndex);
          }));

          var onsetStart, onsetEnd;
          var nucleusStart, nucleusEnd;
          var codaStart, codaEnd;

          var onsetText = self.printConstituent(onsetWords);
          var nucleusText = self.printConstituent(nucleusWords);
          var codaText = self.printConstituent(codaWords);

          if (onsetWords.length > 0) {
            onsetStart = _.first(onsetWords).dependent.wordIndex;
            onsetEnd = _.last(onsetWords).dependent.wordIndex;
          }

          var onset = {
            "start": onsetStart,
            "end": onsetEnd,
            "text": onsetText,
            "words": onsetWords
          };

          if (nucleusWords.length > 0) {
            nucleusStart = _.first(nucleusWords).dependent.wordIndex;
            nucleusEnd = _.last(nucleusWords).dependent.wordIndex;
          }

          var nucleus = {
            "start": nucleusStart,
            "end": nucleusEnd,
            "length": (Math.abs(nucleusEnd - nucleusStart) + 1),
            "dependent": word.dependent,
            "head": {
              "headID": depID,
              "posTag": posTag,
              "relation": word.dependency.relation
            },
            "governor": word.governor,
            "text": nucleusText,
            "words": nucleusWords
          }

          if (codaWords.length > 0) {
            codaStart = _.first(codaWords).dependent.wordIndex;
            codaEnd = _.last(codaWords).dependent.wordIndex;
          }

          var coda = {
            "start": codaStart,
            "end": codaEnd,
            "text": codaText,
            "words": codaWords
          };

          return {
            "onset": onset,
            "nucleus": nucleus,
            "coda": coda
          };
        });
        return spans;
      },

      dependencyToStyle: function(relation) {
        var suffix = "-dependency-label";

        switch (relation) {
          case "amod":    return relation + suffix;
          case "advmod":  return relation + suffix;
          case "dobj":    return relation + suffix;
          case "nsubj":   return relation + suffix;
          case "prep":    return relation + suffix;
          case "root":    return relation + suffix;
          default:        return "";
        }
      },

      isConstituentHead: function(word, constituenHeadID) {
        if (word.dependent.wordIndex === constituenHeadID) { return true; }
        else { return false; }
      },

      minEmotion: function(emotions) {
        return _.min(emotions, function (e) { return e.score; });
      },

      maxEmotion: function(emotions) {
        return _.max(emotions, function (e) { return e.score; });
      }
    }
});
