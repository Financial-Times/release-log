#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const ChangeRequestClient = require('..');
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
		'the change request owner email address'
	)
	.option(
		'-s, --summary <summary>',
		'a short summary of the change'
	)
	.option(
		'-d, --description <description>',
		'a short description of the change'
	)
	.option(
		'-f, --description-file <filename>',
		'file to read description from, instead of --description'
	)
	.option(
		'-r, --reason <reason>',
		'the reason for the change. Default: "Deployment"'
	)
	.option(
		'-c, --open-category <category>',
		'the category for opening the change request. One of "Major", "Minor", "Significant". Default: "Minor"'
	)
	.option(
		'-C, --close-category <category>',
		'the category for closing the change request. One of "Implemented", "Partially Implemented", "Rejected", "Rolled back", "Cancelled". Default: "Implemented"'
	)
	.option(
		'-R, --risk-profile <risk-profile>',
		'the risk profile for the change request. One of "Low", "Medium", "High". Default: "Low"'
	)
	.option(
		'-e, --environment <environment>',
		'the environment the change request applies to. One of "Production", "Test", "Development", "Disaster Recovery". Default: "Test"'
	)
	.option(
		'-O, --outage',
		'whether there will be an outage. Default: false'
	)
	.option(
		'-S, --service <service>',
		'the service that the change request applies to'
	)
	.option(
		'-n, --notify-channel <slack-channel>',
		'the slack channel to notify of the change request'
	)
	.parse(process.argv);

// Create an API client
const crApi = new ChangeRequestClient({
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

// Create and close a change request
console.log(chalk.cyan.underline('Creating a change request'));
crApi.open(openData)
	.then(response => {
		const cr = response.body.changeRequests[0];
		console.log(chalk.green(`Created change request "${cr.id}"`));
		closeData.id = cr.id;
		return crApi.close(closeData);
	})
	.then(response => {
		const cr = response.body.changeRequests[0];
		console.log(chalk.green(`Closed change request "${cr.id}"`));
	})
	.catch(error => {
		console.error(chalk.red(error.message));
		process.exit(1);
	});
