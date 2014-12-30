(function(NAMESPACE) {

	'use strict';

	NAMESPACE.results = (function() {

		var showListOfQuestions = function() {
			var Question = Parse.Object.extend('Question');
			var query = new Parse.Query(Question);
			query.equalTo('available', true);
			query.find({
				success: function(questions) {
					var questionList = [];

					for (var i=0; i < questions.length; i++) {
						questionList.push({
							key: questions[i].id,
							title: questions[i].get('title')
						});
					}

					React.render(
						React.createElement(Results, {questions: questionList}),
						document.getElementById('content')
					);
				},
				error: function(error) {
					console.error('Error: ' + error.code + ' ' + error.message);
				}
			});
		};

		var showResultForQuestion = function(questionId) {
			var res = {}; //response object that grows with every successful promise

			var Question = Parse.Object.extend('Question'); //get Question with ID
			var questionQuery = new Parse.Query(Question);
			questionQuery.include('options');
			questionQuery.get(questionId).then(function(question) {
				res.question = question;

				var ResultObj = Parse.Object.extend('Result'); //get Results for that Question
				var resultQuery = new Parse.Query(ResultObj);
				resultQuery.equalTo('question', question);
				resultQuery.include('answer');
				
				return resultQuery.find()
			}).then(function(results) {
				res.results = results;

				var questionTitle = res.question.get('title');

				var counter = {},
					answers = results.map(function(result) {
						return result.get('answer');
					});

				for (var key in answers) {
					var title = answers[key].get('text');
					counter[title] = counter[title] + 1 || 1; //count the occurances of each answer
				}

				var categories = [],
					pieData = [],
					columnData = [],
					options = res.question.get('options');
				for (var i in options) {
					var text = options[i].get('text');
					var count = counter[text] || 0;

					categories.push(text);
					columnData.push(count);
					pieData.push([text, count]);
				}

				var series = [];
				if (res.question.get('acceptsMultipleOptions')) {
					//bar graph
					series = [{
						name: questionTitle,
						showInLegend: false,
						type: 'column',
						data: columnData
					}];
				} else {
					//pie chart
					series = [{
						name: questionTitle,
						type: 'pie',
						data: pieData
					}];
				}

				React.render(
					React.createElement(Chart, {title: questionTitle, categories: categories, series: series, id: res.question.id}),
					document.getElementById('content')
				);
			}, function(error) {
				console.error('Error: ' + error.code + ' ' + error.message);
			});
		};

		return {
			showListOfQuestions: showListOfQuestions,
			showResultForQuestion: showResultForQuestion
		};
		
	}());

}(APIDAYS));