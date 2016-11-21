'use strict';

const assert = require('proclaim');
const pkg = require('../../../package.json');
const sinon = require('sinon');
require('sinon-as-promised');

describe('lib/release-log', () => {
	let ReleaseLogClient;

	beforeEach(() => {
		ReleaseLogClient = require('../../../lib/release-log');
		global.fetch = require('../mock/fetch');
	});

	it('exports a function', () => {
		assert.isFunction(ReleaseLogClient);
	});

	describe('new ReleaseLogClient(options)', () => {
		let instance;
		let resolvedValue;
		let caughtError;

		beforeEach(() => {
			instance = new ReleaseLogClient({
				apiKey: 'xxxxxx',
				host: 'testhost'
			});
		});

		it('returns an object', () => {
			assert.isObject(instance);
		});

		describe('returned object', () => {

			it('has an `apiKey` property set to the passed in key', () => {
				assert.strictEqual(instance.apiKey, 'xxxxxx');
			});

			it('has a `host` property set to the passed in host', () => {
				assert.strictEqual(instance.host, 'testhost');
			});

			it('has a `userAgent` property', () => {
				assert.strictEqual(instance.userAgent, `ft-release-log/${pkg.version}`);
			});

			it('has a `fetch` method', () => {
				assert.isFunction(instance.fetch);
			});

			describe('.fetch(endpoint, options)', () => {
				let mockBody = {foo: 'bar'};
				let mockResponse;

				beforeEach(() => {
					mockResponse = {
						ok: true,
						json: sinon.stub().resolves(mockBody)
					};
					fetch.resolves(mockResponse);

					return instance.fetch('/v2/foo/bar', {
						method: 'POST'
					}).then(value => resolvedValue = value);
				});

				it('fetches the expected URL with the expected options', () => {
					assert.calledOnce(fetch);
					assert.calledWith(fetch, 'https://testhost/v2/foo/bar');
					assert.deepEqual(fetch.firstCall.args[1], {
						method: 'POST',
						headers: {
							'X-Api-Key': instance.apiKey,
							'User-Agent': instance.userAgent
						}
					});
				});

				it('resolves with the fetch response and JSON body', () => {
					assert.deepEqual(resolvedValue, {
						response: mockResponse,
						body: mockBody
					});
				});

				describe('when the response is not successful', () => {

					beforeEach(() => {

						mockResponse = {
							ok: false,
							status: 456,
							json: sinon.stub().resolves(mockBody)
						};
						fetch.resolves(mockResponse);

						return instance.fetch('/v2/foo/bar', {
							method: 'POST'
						}).catch(error => caughtError = error);
					});

					it('rejects with the expected error', () => {
						assert.instanceOf(caughtError, Error);
						assert.strictEqual(caughtError.message, '/v2/foo/bar responded with a 456 status');
					});

				});

				describe('when the response is not successful and a reason is given', () => {

					beforeEach(() => {

						mockBody = {
							error: 'mock error'
						};
						mockResponse = {
							ok: false,
							status: 456,
							json: sinon.stub().resolves(mockBody)
						};
						fetch.resolves(mockResponse);

						return instance.fetch('/v2/foo/bar', {
							method: 'POST'
						}).catch(error => caughtError = error);
					});

					it('rejects with the expected error', () => {
						assert.instanceOf(caughtError, Error);
						assert.strictEqual(caughtError.message, '/v2/foo/bar responded with a 456 status\nmock error');
					});

				});

				describe('when the response is successful but the body is an error', () => {

					beforeEach(() => {

						mockBody = {
							cause: {
								errorMessage: 'mock error'
							}
						};
						mockResponse = {
							ok: true,
							status: 200,
							json: sinon.stub().resolves(mockBody)
						};
						fetch.resolves(mockResponse);

						return instance.fetch('/v2/foo/bar', {
							method: 'POST'
						}).catch(error => caughtError = error);
					});

					it('rejects with the expected error', () => {
						assert.instanceOf(caughtError, Error);
						assert.strictEqual(caughtError.message, '/v2/foo/bar returned an error\nmock error');
					});

				});

			});

			it('has a `get` method', () => {
				assert.isFunction(instance.get);
			});

			describe('.get(endpoint, options)', () => {
				const mockResponse = {};
				const options = {foo: 'bar'};

				beforeEach(() => {
					instance.fetch = sinon.stub().resolves(mockResponse);
					return instance.get('/v2/foo/bar', options).then(value => resolvedValue = value);
				});

				it('fetches the expected endpoint with the expected options', () => {
					assert.calledOnce(instance.fetch);
					assert.calledWith(instance.fetch, '/v2/foo/bar');
					assert.deepEqual(instance.fetch.firstCall.args[1], {
						method: 'GET',
						foo: 'bar'
					});
				});

				it('resolves with the result of the fetch', () => {
					assert.deepEqual(resolvedValue, mockResponse);
				});

			});

			it('has a `post` method', () => {
				assert.isFunction(instance.post);
			});

			describe('.post(endpoint, data, options)', () => {
				const mockResponse = {};
				const data = {foo: 'bar'};
				const options = {bar: 'baz'};

				beforeEach(() => {
					instance.fetch = sinon.stub().resolves(mockResponse);
					return instance.post('/v2/foo/bar', data, options).then(value => resolvedValue = value);
				});

				it('fetches the expected endpoint with the expected options', () => {
					assert.calledOnce(instance.fetch);
					assert.calledWith(instance.fetch, '/v2/foo/bar');
					assert.deepEqual(instance.fetch.firstCall.args[1], {
						method: 'POST',
						body: '{"foo":"bar"}',
						bar: 'baz',
						headers: {
							'Content-Type': 'application/json'
						}
					});
				});

				it('resolves with the result of the fetch', () => {
					assert.deepEqual(resolvedValue, mockResponse);
				});

			});

			it('has an `open` method', () => {
				assert.isFunction(instance.open);
			});

			describe('.open(data)', () => {
				const data = {foo: 'bar'};
				const mockResponse = {};

				beforeEach(() => {
					instance.post = sinon.stub().resolves(mockResponse);
					return instance.open(data).then(value => resolvedValue = value);
				});

				it('posts to the expected endpoint with the expected options', () => {
					assert.calledOnce(instance.post);
					assert.calledWith(instance.post, '/v2/releaselog');
					assert.deepEqual(instance.post.firstCall.args[1], {
						changeCategory: 'Minor',
						environment: 'Test',
						foo: 'bar',
						notify: false,
						reasonForChangeDetails: 'Deployment',
						riskProfile: 'Low',
						willThereBeAnOutage: 'No'
					});
				});

				it('resolves with the result of the post', () => {
					assert.deepEqual(resolvedValue, mockResponse);
				});

			});

			it('has a `close` method', () => {
				assert.isFunction(instance.close);
			});

			describe('.close(data)', () => {
				const data = {foo: 'bar'};
				const mockResponse = {};

				beforeEach(() => {
					instance.post = sinon.stub().resolves(mockResponse);
					return instance.close(data).then(value => resolvedValue = value);
				});

				it('posts to the expected endpoint with the expected options', () => {
					assert.calledOnce(instance.post);
					assert.calledWith(instance.post, '/v2/close');
					assert.deepEqual(instance.post.firstCall.args[1], {
						closeCategory: 'Implemented',
						foo: 'bar',
						notify: false
					});
				});

				it('resolves with the result of the post', () => {
					assert.deepEqual(resolvedValue, mockResponse);
				});

			});

		});

		describe('when `options.host` is not set', () => {

			beforeEach(() => {
				instance = new ReleaseLogClient({
					apiKey: 'xxxxxx'
				});
			});

			describe('returned object', () => {

				it('has a `host` property set to "cr-api.in.ft.com"', () => {
					assert.strictEqual(instance.host, 'cr-api.in.ft.com');
				});

			});

		});

	});

});
