"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
const discrimS = Symbol();
const discrimCacheS = Symbol();

/** @template T */
class Cache extends Array {
	/**
	 * @param {string} [discrim]
	 * @param {number} [limit]
	 */
	constructor(discrim, limit) {
		super();
		this[discrimS] = discrim || "id";
		this[discrimCacheS] = {};
		this.limit = limit;
	}

	/**
	 * @param {string} key
	 * @param {any} [value]
	 * @returns {T}
	 */
	get(key, value) {
		let valid;
		if (typeof key === 'function') {
			valid = key;
			key = null;
		} else if (key && !value) {
			return this[discrimCacheS][key] || null;
		} else if (key === this[discrimS] && typeof value === "string") {
			return this[discrimCacheS][value] || null;
		} else if (value instanceof RegExp) {
			valid =
				/**
				 * @param {string} item
				 */
				function (item) {
				return value.test(item);
			};
		} else if (typeof value !== 'function') {
			valid = function (item) {
				return item == value;
			};
		}

		for (const item of this) {
			if (valid(key == null ? item : item[key])) {
				return item;
			}
		}
	}

	/**
	 * @param {string} key
	 * @param {any} value
	 */
	has(key, value) {
		return !!this.get(key, value);
	}

	/**
	 * @param {string} key
	 * @param {any} [value]
	 * @returns {Cache<T>}
	 */
	getAll(key, value) {
		var found = new Cache(this[discrimS]);
		let valid

		if (typeof key === 'function') {
			valid = key;
			key = null;
		} else if (value instanceof RegExp) {
			valid =
				/**
				 * @param {string} item
				 */
				function (item) {
				return value.test(item);
			};
		} else if (typeof value !== 'function') {
			valid = function (item) {
				return item == value;
			};
		}

		for (var item of this) {
			if (valid(key == null ? item : item[key])) {
				found.add(item);
			}
		}

		return found;
	}

	/**
	 * @param {T} data
	 */
	add(data) {
		var cacheKey = data[this[discrimS]];
		if (this[discrimCacheS][cacheKey]) {
			return this[discrimCacheS][cacheKey];
		}
		if (this.limit && this.length >= this.limit) {
			this.splice(0, 1);
		}
		this.push(data);
		this[discrimCacheS][cacheKey] = data;
		return data;
	}

	/**
	 * @param {T} old
	 * @param {T} data
	 */
	update(old, data) {
		var obj = this[discrimCacheS][old[this[discrimS]]];
		if (obj) {
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					obj[key] = data[key];
				}
			}
			return obj;
		}
		return false;
	}

	/**
	 * @returns {T}
	 */
	random() {
		return this[Math.floor(Math.random() * this.length)];
	}

	/**
	 * @param {T} data
	 */
	remove(data) {
		if (!this[discrimCacheS][data[this[discrimS]]]) return false;

		delete this[discrimCacheS][data[this[discrimS]]];
		for (let i in this) {
			if (this[i] && this[i][this[discrimS]] === data[this[discrimS]]) {
				// @ts-ignore
				this.splice(i, 1);
				return true;
			}
		}
		return false;
	}
}
module.exports = Cache;
