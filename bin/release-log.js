#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const ReleaseLogClient = require('..');
const pkg = require('../package.json');
const program = require('commander');
const fs = require('fs');

// Command-line configuration
program
	.usage('[options]')
	.version(pkg.version)
	.option(
		'-a, --api-key <key>',
		'the API key to use when accessing the CR API',
		process.env.KONSTRUCTOR_API_KEY
	)
	.option(
		'-o, --owner-email <email>',
		'the release log owner email address'
	)
	.option(
		'-s, --summary <summary>',
		'a short summary of the release'
	)
	.option(
		'-d, --description <description>',
		'a short description of the release'
	)
	.option(
		'-f, --description-file <filename>',
		'file to read description from, instead of --description'
	)
	.option(
		'-r, --reason <reason>',
		'the reason for the release. Default: "Deployment"'
	)
	.option(
		'-c, --open-category <category>',
		'the category for opening the release log. One of "Major", "Minor", "Significant". Default: "Minor"'
	)
	.option(
		'-C, --close-category <category>',
		'the category for closing the release log. One of "Implemented", "Partially Implemented", "Rejected", "Rolled back", "Cancelled". Default: "Implemented"'
	)
	.option(
		'-R, --risk-profile <risk-profile>',
		'the risk profile for the release log. One of "Low", "Medium", "High". Default: "Low"'
	)
	.option(
		'-e, --environment <environment>',
		'the environment the release log applies to. One of "Production", "Test", "Development", "Disaster Recovery". Default: "Test"'
	)
	.option(
		'-O, --outage',
		'whether there will be an outage. Default: false'
	)
	.option(
		'-S, --service <service>',
		'the service that the release log applies to'
	)
	.option(
		'-n, --notify-channel <slack-channel>',
		'the slack channel to notify of the release log'
	)
	.parse(process.argv);

// Create an API client
const releaseLogApi = new ReleaseLogClient({
	apiKey: program.apiKey
});

// Gather up the data
const openData = {
	ownerEmailAddress: program.ownerEmail,
	summaryOfChange: program.summary,
	changeDescription: program.descriptionFile ? fs.readFileSync(program.descriptionFile, 'utf8') : program.description,
	reasonForChangeDetails: program.reason,
	changeCategory: program.openCategory,
	riskProfile: program.riskProfile,
	environment: program.environment,
	willThereBeAnOutage: program.outage,
	resourceOne: program.ownerEmail,
	serviceIds: program.service,
	notifyChannel: program.notifyChannel,
	notify: !!(program.notifyChannel)
};
const closeData = {
	closedByEmailAddress: program.ownerEmail,
	closeCategory: program.closeCategory,
	notifyChannel: program.notifyChannel,
	notify: !!(program.notifyChannel)
};

// Create and close a release log
console.log(chalk.cyan.underline('Creating a release log'));
releaseLogApi.open(openData)
	.then(response => {
		const cr = response.body.changeRequests[0];
		console.log(chalk.green(`Created release log "${cr.id}"`));
		closeData.id = cr.id;
		return releaseLogApi.close(closeData);
	})
	.then(response => {
		const cr = response.body.changeRequests[0];
		console.log(chalk.green(`Closed release log "${cr.id}"`));
	})
	.catch(error => {
		console.error(`${chalk.red(error.message)}
${error.stack ? chalk.grey(error.stack.replace(error.message, '')) : ''}`);
		process.exit(1);
	});
