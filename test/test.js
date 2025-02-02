const test = require('ava');
const keyvTestSuite = require('@jytesh/keyv-test-suite');
const Keyv = require('keyv');
const KeyvSql = require('this');

const sqlite3 = require('sqlite3');
const pify = require('pify');

class TestSqlite extends KeyvSql {
	constructor(options) {
		options = Object.assign({
			dialect: 'sqlite',
			db: 'test/testdb.sqlite'
		}, options);

		options.connect = () => new Promise((resolve, reject) => {
			const db = new sqlite3.Database(options.db, error => {
				if (error) {
					reject(error);
				} else {
					db.configure('busyTimeout', 30000);
					resolve(db);
				}
			});
		})
			.then(db => pify(db.all).bind(db));

		super(options);
	}
}

const store = () => new TestSqlite();
keyvTestSuite(test, Keyv, store);

test('Default key data type is VARCHAR(255)', t => {
	const store = new TestSqlite();
	t.is(store.entry.key.dataType, 'VARCHAR(255)');
});

test('keySize option overrides default', t => {
	const store = new TestSqlite({ keySize: 100 });
	t.is(store.entry.key.dataType, 'VARCHAR(100)');
});
