module.exports = function (config) {
	'use strict';

	config.set({
		basePath: '../../',
		frameworks: ['jasmine'],
		files: [
			'bower_components/angular*/*.js',
			'../../bower_components/angular/angular-mocks.js',
            '../../bower_components/angular/angular-route.js',
            'js/app.js',
			'js/**/*.js',
			'test/unit/todoCtrlSpec.js',
            'test/unit/directivesSpec.js'
		],
		autoWatch: false,
		singleRun: true,
		browsers: ['Chrome', 'Firefox']
	});
};
