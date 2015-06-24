(function () {
    var root = this;
    var previousUnderscore = root._;
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
    var push = ArrayProto.push, slice = ArrayProto.slice, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
    var nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind, nativeCreate = Object.create;
    var Ctor = function () {
    };
    var _ = function (obj) {
        if (obj instanceof _)
            return obj;
        if (!(this instanceof _))
            return new _(obj);
        this._wrapped = obj;
    };
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }
    _.VERSION = '1.8.3';
    var optimizeCb = function (func, context, argCount) {
        if (context === void 0)
            return func;
        switch (argCount == null ? 3 : argCount) {
        case 1:
            return function (value) {
                return func.call(context, value);
            };
        case 2:
            return function (value, other) {
                return func.call(context, value, other);
            };
        case 3:
            return function (value, index, collection) {
                return func.call(context, value, index, collection);
            };
        case 4:
            return function (accumulator, value, index, collection) {
                return func.call(context, accumulator, value, index, collection);
            };
        }
        return function () {
            return func.apply(context, arguments);
        };
    };
    var cb = function (value, context, argCount) {
        if (value == null)
            return _.identity;
        if (_.isFunction(value))
            return optimizeCb(value, context, argCount);
        if (_.isObject(value))
            return _.matcher(value);
        return _.property(value);
    };
    _.iteratee = function (value, context) {
        return cb(value, context, Infinity);
    };
    var createAssigner = function (keysFunc, undefinedOnly) {
        return function (obj) {
            var length = arguments.length;
            if (length < 2 || obj == null)
                return obj;
            for (var index = 1; index < length; index++) {
                var source = arguments[index], keys = keysFunc(source), l = keys.length;
                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    if (!undefinedOnly || obj[key] === void 0)
                        obj[key] = source[key];
                }
            }
            return obj;
        };
    };
    var baseCreate = function (prototype) {
        if (!_.isObject(prototype))
            return {};
        if (nativeCreate)
            return nativeCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor();
        Ctor.prototype = null;
        return result;
    };
    var property = function (key) {
        return function (obj) {
            return obj == null ? void 0 : obj[key];
        };
    };
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var getLength = property('length');
    var isArrayLike = function (collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };
    _.each = _.forEach = function (obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    };
    _.map = _.collect = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, results = Array(length);
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            results[index] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };
    function createReduce(dir) {
        function iterator(obj, iteratee, memo, keys, index, length) {
            for (; index >= 0 && index < length; index += dir) {
                var currentKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        }
        return function (obj, iteratee, memo, context) {
            iteratee = optimizeCb(iteratee, context, 4);
            var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = dir > 0 ? 0 : length - 1;
            if (arguments.length < 3) {
                memo = obj[keys ? keys[index] : index];
                index += dir;
            }
            return iterator(obj, iteratee, memo, keys, index, length);
        };
    }
    _.reduce = _.foldl = _.inject = createReduce(1);
    _.reduceRight = _.foldr = createReduce(-1);
    _.find = _.detect = function (obj, predicate, context) {
        var key;
        if (isArrayLike(obj)) {
            key = _.findIndex(obj, predicate, context);
        } else {
            key = _.findKey(obj, predicate, context);
        }
        if (key !== void 0 && key !== -1)
            return obj[key];
    };
    _.filter = _.select = function (obj, predicate, context) {
        var results = [];
        predicate = cb(predicate, context);
        _.each(obj, function (value, index, list) {
            if (predicate(value, index, list))
                results.push(value);
        });
        return results;
    };
    _.reject = function (obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context);
    };
    _.every = _.all = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj))
                return false;
        }
        return true;
    };
    _.some = _.any = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj))
                return true;
        }
        return false;
    };
    _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
        if (!isArrayLike(obj))
            obj = _.values(obj);
        if (typeof fromIndex != 'number' || guard)
            fromIndex = 0;
        return _.indexOf(obj, item, fromIndex) >= 0;
    };
    _.invoke = function (obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function (value) {
            var func = isFunc ? method : value[method];
            return func == null ? func : func.apply(value, args);
        });
    };
    _.pluck = function (obj, key) {
        return _.map(obj, _.property(key));
    };
    _.where = function (obj, attrs) {
        return _.filter(obj, _.matcher(attrs));
    };
    _.findWhere = function (obj, attrs) {
        return _.find(obj, _.matcher(attrs));
    };
    _.max = function (obj, iteratee, context) {
        var result = -Infinity, lastComputed = -Infinity, value, computed;
        if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value > result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index, list) {
                computed = iteratee(value, index, list);
                if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                    result = value;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };
    _.min = function (obj, iteratee, context) {
        var result = Infinity, lastComputed = Infinity, value, computed;
        if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value < result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index, list) {
                computed = iteratee(value, index, list);
                if (computed < lastComputed || computed === Infinity && result === Infinity) {
                    result = value;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };
    _.shuffle = function (obj) {
        var set = isArrayLike(obj) ? obj : _.values(obj);
        var length = set.length;
        var shuffled = Array(length);
        for (var index = 0, rand; index < length; index++) {
            rand = _.random(0, index);
            if (rand !== index)
                shuffled[index] = shuffled[rand];
            shuffled[rand] = set[index];
        }
        return shuffled;
    };
    _.sample = function (obj, n, guard) {
        if (n == null || guard) {
            if (!isArrayLike(obj))
                obj = _.values(obj);
            return obj[_.random(obj.length - 1)];
        }
        return _.shuffle(obj).slice(0, Math.max(0, n));
    };
    _.sortBy = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        return _.pluck(_.map(obj, function (value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iteratee(value, index, list)
            };
        }).sort(function (left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0)
                    return 1;
                if (a < b || b === void 0)
                    return -1;
            }
            return left.index - right.index;
        }), 'value');
    };
    var group = function (behavior) {
        return function (obj, iteratee, context) {
            var result = {};
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index) {
                var key = iteratee(value, index, obj);
                behavior(result, value, key);
            });
            return result;
        };
    };
    _.groupBy = group(function (result, value, key) {
        if (_.has(result, key))
            result[key].push(value);
        else
            result[key] = [value];
    });
    _.indexBy = group(function (result, value, key) {
        result[key] = value;
    });
    _.countBy = group(function (result, value, key) {
        if (_.has(result, key))
            result[key]++;
        else
            result[key] = 1;
    });
    _.toArray = function (obj) {
        if (!obj)
            return [];
        if (_.isArray(obj))
            return slice.call(obj);
        if (isArrayLike(obj))
            return _.map(obj, _.identity);
        return _.values(obj);
    };
    _.size = function (obj) {
        if (obj == null)
            return 0;
        return isArrayLike(obj) ? obj.length : _.keys(obj).length;
    };
    _.partition = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var pass = [], fail = [];
        _.each(obj, function (value, key, obj) {
            (predicate(value, key, obj) ? pass : fail).push(value);
        });
        return [
            pass,
            fail
        ];
    };
    _.first = _.head = _.take = function (array, n, guard) {
        if (array == null)
            return void 0;
        if (n == null || guard)
            return array[0];
        return _.initial(array, array.length - n);
    };
    _.initial = function (array, n, guard) {
        return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
    };
    _.last = function (array, n, guard) {
        if (array == null)
            return void 0;
        if (n == null || guard)
            return array[array.length - 1];
        return _.rest(array, Math.max(0, array.length - n));
    };
    _.rest = _.tail = _.drop = function (array, n, guard) {
        return slice.call(array, n == null || guard ? 1 : n);
    };
    _.compact = function (array) {
        return _.filter(array, _.identity);
    };
    var flatten = function (input, shallow, strict, startIndex) {
        var output = [], idx = 0;
        for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
            var value = input[i];
            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                if (!shallow)
                    value = flatten(value, shallow, strict);
                var j = 0, len = value.length;
                output.length += len;
                while (j < len) {
                    output[idx++] = value[j++];
                }
            } else if (!strict) {
                output[idx++] = value;
            }
        }
        return output;
    };
    _.flatten = function (array, shallow) {
        return flatten(array, shallow, false);
    };
    _.without = function (array) {
        return _.difference(array, slice.call(arguments, 1));
    };
    _.uniq = _.unique = function (array, isSorted, iteratee, context) {
        if (!_.isBoolean(isSorted)) {
            context = iteratee;
            iteratee = isSorted;
            isSorted = false;
        }
        if (iteratee != null)
            iteratee = cb(iteratee, context);
        var result = [];
        var seen = [];
        for (var i = 0, length = getLength(array); i < length; i++) {
            var value = array[i], computed = iteratee ? iteratee(value, i, array) : value;
            if (isSorted) {
                if (!i || seen !== computed)
                    result.push(value);
                seen = computed;
            } else if (iteratee) {
                if (!_.contains(seen, computed)) {
                    seen.push(computed);
                    result.push(value);
                }
            } else if (!_.contains(result, value)) {
                result.push(value);
            }
        }
        return result;
    };
    _.union = function () {
        return _.uniq(flatten(arguments, true, true));
    };
    _.intersection = function (array) {
        var result = [];
        var argsLength = arguments.length;
        for (var i = 0, length = getLength(array); i < length; i++) {
            var item = array[i];
            if (_.contains(result, item))
                continue;
            for (var j = 1; j < argsLength; j++) {
                if (!_.contains(arguments[j], item))
                    break;
            }
            if (j === argsLength)
                result.push(item);
        }
        return result;
    };
    _.difference = function (array) {
        var rest = flatten(arguments, true, true, 1);
        return _.filter(array, function (value) {
            return !_.contains(rest, value);
        });
    };
    _.zip = function () {
        return _.unzip(arguments);
    };
    _.unzip = function (array) {
        var length = array && _.max(array, getLength).length || 0;
        var result = Array(length);
        for (var index = 0; index < length; index++) {
            result[index] = _.pluck(array, index);
        }
        return result;
    };
    _.object = function (list, values) {
        var result = {};
        for (var i = 0, length = getLength(list); i < length; i++) {
            if (values) {
                result[list[i]] = values[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };
    function createPredicateIndexFinder(dir) {
        return function (array, predicate, context) {
            predicate = cb(predicate, context);
            var length = getLength(array);
            var index = dir > 0 ? 0 : length - 1;
            for (; index >= 0 && index < length; index += dir) {
                if (predicate(array[index], index, array))
                    return index;
            }
            return -1;
        };
    }
    _.findIndex = createPredicateIndexFinder(1);
    _.findLastIndex = createPredicateIndexFinder(-1);
    _.sortedIndex = function (array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1);
        var value = iteratee(obj);
        var low = 0, high = getLength(array);
        while (low < high) {
            var mid = Math.floor((low + high) / 2);
            if (iteratee(array[mid]) < value)
                low = mid + 1;
            else
                high = mid;
        }
        return low;
    };
    function createIndexFinder(dir, predicateFind, sortedIndex) {
        return function (array, item, idx) {
            var i = 0, length = getLength(array);
            if (typeof idx == 'number') {
                if (dir > 0) {
                    i = idx >= 0 ? idx : Math.max(idx + length, i);
                } else {
                    length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                }
            } else if (sortedIndex && idx && length) {
                idx = sortedIndex(array, item);
                return array[idx] === item ? idx : -1;
            }
            if (item !== item) {
                idx = predicateFind(slice.call(array, i, length), _.isNaN);
                return idx >= 0 ? idx + i : -1;
            }
            for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                if (array[idx] === item)
                    return idx;
            }
            return -1;
        };
    }
    _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
    _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
    _.range = function (start, stop, step) {
        if (stop == null) {
            stop = start || 0;
            start = 0;
        }
        step = step || 1;
        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);
        for (var idx = 0; idx < length; idx++, start += step) {
            range[idx] = start;
        }
        return range;
    };
    var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
        if (!(callingContext instanceof boundFunc))
            return sourceFunc.apply(context, args);
        var self = baseCreate(sourceFunc.prototype);
        var result = sourceFunc.apply(self, args);
        if (_.isObject(result))
            return result;
        return self;
    };
    _.bind = function (func, context) {
        if (nativeBind && func.bind === nativeBind)
            return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func))
            throw new TypeError('Bind must be called on a function');
        var args = slice.call(arguments, 2);
        var bound = function () {
            return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
        };
        return bound;
    };
    _.partial = function (func) {
        var boundArgs = slice.call(arguments, 1);
        var bound = function () {
            var position = 0, length = boundArgs.length;
            var args = Array(length);
            for (var i = 0; i < length; i++) {
                args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
            }
            while (position < arguments.length)
                args.push(arguments[position++]);
            return executeBound(func, bound, this, this, args);
        };
        return bound;
    };
    _.bindAll = function (obj) {
        var i, length = arguments.length, key;
        if (length <= 1)
            throw new Error('bindAll must be passed function names');
        for (i = 1; i < length; i++) {
            key = arguments[i];
            obj[key] = _.bind(obj[key], obj);
        }
        return obj;
    };
    _.memoize = function (func, hasher) {
        var memoize = function (key) {
            var cache = memoize.cache;
            var address = '' + (hasher ? hasher.apply(this, arguments) : key);
            if (!_.has(cache, address))
                cache[address] = func.apply(this, arguments);
            return cache[address];
        };
        memoize.cache = {};
        return memoize;
    };
    _.delay = function (func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function () {
            return func.apply(null, args);
        }, wait);
    };
    _.defer = _.partial(_.delay, _, 1);
    _.throttle = function (func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options)
            options = {};
        var later = function () {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout)
                context = args = null;
        };
        return function () {
            var now = _.now();
            if (!previous && options.leading === false)
                previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout)
                    context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };
    _.debounce = function (func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        var later = function () {
            var last = _.now() - timestamp;
            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout)
                        context = args = null;
                }
            }
        };
        return function () {
            context = this;
            args = arguments;
            timestamp = _.now();
            var callNow = immediate && !timeout;
            if (!timeout)
                timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };
    };
    _.wrap = function (func, wrapper) {
        return _.partial(wrapper, func);
    };
    _.negate = function (predicate) {
        return function () {
            return !predicate.apply(this, arguments);
        };
    };
    _.compose = function () {
        var args = arguments;
        var start = args.length - 1;
        return function () {
            var i = start;
            var result = args[start].apply(this, arguments);
            while (i--)
                result = args[i].call(this, result);
            return result;
        };
    };
    _.after = function (times, func) {
        return function () {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };
    _.before = function (times, func) {
        var memo;
        return function () {
            if (--times > 0) {
                memo = func.apply(this, arguments);
            }
            if (times <= 1)
                func = null;
            return memo;
        };
    };
    _.once = _.partial(_.before, 2);
    var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
    var nonEnumerableProps = [
        'valueOf',
        'isPrototypeOf',
        'toString',
        'propertyIsEnumerable',
        'hasOwnProperty',
        'toLocaleString'
    ];
    function collectNonEnumProps(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;
        var prop = 'constructor';
        if (_.has(obj, prop) && !_.contains(keys, prop))
            keys.push(prop);
        while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                keys.push(prop);
            }
        }
    }
    _.keys = function (obj) {
        if (!_.isObject(obj))
            return [];
        if (nativeKeys)
            return nativeKeys(obj);
        var keys = [];
        for (var key in obj)
            if (_.has(obj, key))
                keys.push(key);
        if (hasEnumBug)
            collectNonEnumProps(obj, keys);
        return keys;
    };
    _.allKeys = function (obj) {
        if (!_.isObject(obj))
            return [];
        var keys = [];
        for (var key in obj)
            keys.push(key);
        if (hasEnumBug)
            collectNonEnumProps(obj, keys);
        return keys;
    };
    _.values = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    };
    _.mapObject = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = _.keys(obj), length = keys.length, results = {}, currentKey;
        for (var index = 0; index < length; index++) {
            currentKey = keys[index];
            results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };
    _.pairs = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = Array(length);
        for (var i = 0; i < length; i++) {
            pairs[i] = [
                keys[i],
                obj[keys[i]]
            ];
        }
        return pairs;
    };
    _.invert = function (obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    };
    _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key]))
                names.push(key);
        }
        return names.sort();
    };
    _.extend = createAssigner(_.allKeys);
    _.extendOwn = _.assign = createAssigner(_.keys);
    _.findKey = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = _.keys(obj), key;
        for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (predicate(obj[key], key, obj))
                return key;
        }
    };
    _.pick = function (object, oiteratee, context) {
        var result = {}, obj = object, iteratee, keys;
        if (obj == null)
            return result;
        if (_.isFunction(oiteratee)) {
            keys = _.allKeys(obj);
            iteratee = optimizeCb(oiteratee, context);
        } else {
            keys = flatten(arguments, false, false, 1);
            iteratee = function (value, key, obj) {
                return key in obj;
            };
            obj = Object(obj);
        }
        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var value = obj[key];
            if (iteratee(value, key, obj))
                result[key] = value;
        }
        return result;
    };
    _.omit = function (obj, iteratee, context) {
        if (_.isFunction(iteratee)) {
            iteratee = _.negate(iteratee);
        } else {
            var keys = _.map(flatten(arguments, false, false, 1), String);
            iteratee = function (value, key) {
                return !_.contains(keys, key);
            };
        }
        return _.pick(obj, iteratee, context);
    };
    _.defaults = createAssigner(_.allKeys, true);
    _.create = function (prototype, props) {
        var result = baseCreate(prototype);
        if (props)
            _.extendOwn(result, props);
        return result;
    };
    _.clone = function (obj) {
        if (!_.isObject(obj))
            return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };
    _.tap = function (obj, interceptor) {
        interceptor(obj);
        return obj;
    };
    _.isMatch = function (object, attrs) {
        var keys = _.keys(attrs), length = keys.length;
        if (object == null)
            return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj))
                return false;
        }
        return true;
    };
    var eq = function (a, b, aStack, bStack) {
        if (a === b)
            return a !== 0 || 1 / a === 1 / b;
        if (a == null || b == null)
            return a === b;
        if (a instanceof _)
            a = a._wrapped;
        if (b instanceof _)
            b = b._wrapped;
        var className = toString.call(a);
        if (className !== toString.call(b))
            return false;
        switch (className) {
        case '[object RegExp]':
        case '[object String]':
            return '' + a === '' + b;
        case '[object Number]':
            if (+a !== +a)
                return +b !== +b;
            return +a === 0 ? 1 / +a === 1 / b : +a === +b;
        case '[object Date]':
        case '[object Boolean]':
            return +a === +b;
        }
        var areArrays = className === '[object Array]';
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object')
                return false;
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            if (aStack[length] === a)
                return bStack[length] === b;
        }
        aStack.push(a);
        bStack.push(b);
        if (areArrays) {
            length = a.length;
            if (length !== b.length)
                return false;
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack))
                    return false;
            }
        } else {
            var keys = _.keys(a), key;
            length = keys.length;
            if (_.keys(b).length !== length)
                return false;
            while (length--) {
                key = keys[length];
                if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack)))
                    return false;
            }
        }
        aStack.pop();
        bStack.pop();
        return true;
    };
    _.isEqual = function (a, b) {
        return eq(a, b);
    };
    _.isEmpty = function (obj) {
        if (obj == null)
            return true;
        if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)))
            return obj.length === 0;
        return _.keys(obj).length === 0;
    };
    _.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };
    _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) === '[object Array]';
    };
    _.isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };
    _.each([
        'Arguments',
        'Function',
        'String',
        'Number',
        'Date',
        'RegExp',
        'Error'
    ], function (name) {
        _['is' + name] = function (obj) {
            return toString.call(obj) === '[object ' + name + ']';
        };
    });
    if (!_.isArguments(arguments)) {
        _.isArguments = function (obj) {
            return _.has(obj, 'callee');
        };
    }
    if (typeof /./ != 'function' && typeof Int8Array != 'object') {
        _.isFunction = function (obj) {
            return typeof obj == 'function' || false;
        };
    }
    _.isFinite = function (obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };
    _.isNaN = function (obj) {
        return _.isNumber(obj) && obj !== +obj;
    };
    _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    };
    _.isNull = function (obj) {
        return obj === null;
    };
    _.isUndefined = function (obj) {
        return obj === void 0;
    };
    _.has = function (obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
    };
    _.noConflict = function () {
        root._ = previousUnderscore;
        return this;
    };
    _.identity = function (value) {
        return value;
    };
    _.constant = function (value) {
        return function () {
            return value;
        };
    };
    _.noop = function () {
    };
    _.property = property;
    _.propertyOf = function (obj) {
        return obj == null ? function () {
        } : function (key) {
            return obj[key];
        };
    };
    _.matcher = _.matches = function (attrs) {
        attrs = _.extendOwn({}, attrs);
        return function (obj) {
            return _.isMatch(obj, attrs);
        };
    };
    _.times = function (n, iteratee, context) {
        var accum = Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < n; i++)
            accum[i] = iteratee(i);
        return accum;
    };
    _.random = function (min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };
    _.now = Date.now || function () {
        return new Date().getTime();
    };
    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#x27;',
        '`': '&#x60;'
    };
    var unescapeMap = _.invert(escapeMap);
    var createEscaper = function (map) {
        var escaper = function (match) {
            return map[match];
        };
        var source = '(?:' + _.keys(map).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function (string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };
    _.escape = createEscaper(escapeMap);
    _.unescape = createEscaper(unescapeMap);
    _.result = function (object, property, fallback) {
        var value = object == null ? void 0 : object[property];
        if (value === void 0) {
            value = fallback;
        }
        return _.isFunction(value) ? value.call(object) : value;
    };
    var idCounter = 0;
    _.uniqueId = function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    var noMatch = /(.)^/;
    var escapes = {
        '\'': '\'',
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };
    var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
    var escapeChar = function (match) {
        return '\\' + escapes[match];
    };
    _.template = function (text, settings, oldSettings) {
        if (!settings && oldSettings)
            settings = oldSettings;
        settings = _.defaults({}, settings, _.templateSettings);
        var matcher = RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');
        var index = 0;
        var source = '__p+=\'';
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, escapeChar);
            index = offset + match.length;
            if (escape) {
                source += '\'+\n((__t=(' + escape + '))==null?\'\':_.escape(__t))+\n\'';
            } else if (interpolate) {
                source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
            } else if (evaluate) {
                source += '\';\n' + evaluate + '\n__p+=\'';
            }
            return match;
        });
        source += '\';\n';
        if (!settings.variable)
            source = 'with(obj||{}){\n' + source + '}\n';
        source = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + source + 'return __p;\n';
        try {
            var render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }
        var template = function (data) {
            return render.call(this, data, _);
        };
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';
        return template;
    };
    _.chain = function (obj) {
        var instance = _(obj);
        instance._chain = true;
        return instance;
    };
    var result = function (instance, obj) {
        return instance._chain ? _(obj).chain() : obj;
    };
    _.mixin = function (obj) {
        _.each(_.functions(obj), function (name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function () {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result(this, func.apply(_, args));
            };
        });
    };
    _.mixin(_);
    _.each([
        'pop',
        'push',
        'reverse',
        'shift',
        'sort',
        'splice',
        'unshift'
    ], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name === 'shift' || name === 'splice') && obj.length === 0)
                delete obj[0];
            return result(this, obj);
        };
    });
    _.each([
        'concat',
        'join',
        'slice'
    ], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            return result(this, method.apply(this._wrapped, arguments));
        };
    });
    _.prototype.value = function () {
        return this._wrapped;
    };
    _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
    _.prototype.toString = function () {
        return '' + this._wrapped;
    };
    if (typeof define === 'function' && define.amd) {
        define('underscore', [], function () {
            return _;
        });
    }
}.call(this));
(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ? factory(global, true) : function (w) {
            if (!w.document) {
                throw new Error('jQuery requires a window with a document');
            }
            return factory(w);
        };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    var arr = [];
    var slice = arr.slice;
    var concat = arr.concat;
    var push = arr.push;
    var indexOf = arr.indexOf;
    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;
    var support = {};
    var document = window.document, version = '2.1.4', jQuery = function (selector, context) {
            return new jQuery.fn.init(selector, context);
        }, rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, rmsPrefix = /^-ms-/, rdashAlpha = /-([\da-z])/gi, fcamelCase = function (all, letter) {
            return letter.toUpperCase();
        };
    jQuery.fn = jQuery.prototype = {
        jquery: version,
        constructor: jQuery,
        selector: '',
        length: 0,
        toArray: function () {
            return slice.call(this);
        },
        get: function (num) {
            return num != null ? num < 0 ? this[num + this.length] : this[num] : slice.call(this);
        },
        pushStack: function (elems) {
            var ret = jQuery.merge(this.constructor(), elems);
            ret.prevObject = this;
            ret.context = this.context;
            return ret;
        },
        each: function (callback, args) {
            return jQuery.each(this, callback, args);
        },
        map: function (callback) {
            return this.pushStack(jQuery.map(this, function (elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
        slice: function () {
            return this.pushStack(slice.apply(this, arguments));
        },
        first: function () {
            return this.eq(0);
        },
        last: function () {
            return this.eq(-1);
        },
        eq: function (i) {
            var len = this.length, j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
        },
        end: function () {
            return this.prevObject || this.constructor(null);
        },
        push: push,
        sort: arr.sort,
        splice: arr.splice
    };
    jQuery.extend = jQuery.fn.extend = function () {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        if (typeof target !== 'object' && !jQuery.isFunction(target)) {
            target = {};
        }
        if (i === length) {
            target = this;
            i--;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];
                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }
                        target[name] = jQuery.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    jQuery.extend({
        expando: 'jQuery' + (version + Math.random()).replace(/\D/g, ''),
        isReady: true,
        error: function (msg) {
            throw new Error(msg);
        },
        noop: function () {
        },
        isFunction: function (obj) {
            return jQuery.type(obj) === 'function';
        },
        isArray: Array.isArray,
        isWindow: function (obj) {
            return obj != null && obj === obj.window;
        },
        isNumeric: function (obj) {
            return !jQuery.isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
        },
        isPlainObject: function (obj) {
            if (jQuery.type(obj) !== 'object' || obj.nodeType || jQuery.isWindow(obj)) {
                return false;
            }
            if (obj.constructor && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
            return true;
        },
        isEmptyObject: function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },
        type: function (obj) {
            if (obj == null) {
                return obj + '';
            }
            return typeof obj === 'object' || typeof obj === 'function' ? class2type[toString.call(obj)] || 'object' : typeof obj;
        },
        globalEval: function (code) {
            var script, indirect = eval;
            code = jQuery.trim(code);
            if (code) {
                if (code.indexOf('use strict') === 1) {
                    script = document.createElement('script');
                    script.text = code;
                    document.head.appendChild(script).parentNode.removeChild(script);
                } else {
                    indirect(code);
                }
            }
        },
        camelCase: function (string) {
            return string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, fcamelCase);
        },
        nodeName: function (elem, name) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },
        each: function (obj, callback, args) {
            var value, i = 0, length = obj.length, isArray = isArraylike(obj);
            if (args) {
                if (isArray) {
                    for (; i < length; i++) {
                        value = callback.apply(obj[i], args);
                        if (value === false) {
                            break;
                        }
                    }
                } else {
                    for (i in obj) {
                        value = callback.apply(obj[i], args);
                        if (value === false) {
                            break;
                        }
                    }
                }
            } else {
                if (isArray) {
                    for (; i < length; i++) {
                        value = callback.call(obj[i], i, obj[i]);
                        if (value === false) {
                            break;
                        }
                    }
                } else {
                    for (i in obj) {
                        value = callback.call(obj[i], i, obj[i]);
                        if (value === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },
        trim: function (text) {
            return text == null ? '' : (text + '').replace(rtrim, '');
        },
        makeArray: function (arr, results) {
            var ret = results || [];
            if (arr != null) {
                if (isArraylike(Object(arr))) {
                    jQuery.merge(ret, typeof arr === 'string' ? [arr] : arr);
                } else {
                    push.call(ret, arr);
                }
            }
            return ret;
        },
        inArray: function (elem, arr, i) {
            return arr == null ? -1 : indexOf.call(arr, elem, i);
        },
        merge: function (first, second) {
            var len = +second.length, j = 0, i = first.length;
            for (; j < len; j++) {
                first[i++] = second[j];
            }
            first.length = i;
            return first;
        },
        grep: function (elems, callback, invert) {
            var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert;
            for (; i < length; i++) {
                callbackInverse = !callback(elems[i], i);
                if (callbackInverse !== callbackExpect) {
                    matches.push(elems[i]);
                }
            }
            return matches;
        },
        map: function (elems, callback, arg) {
            var value, i = 0, length = elems.length, isArray = isArraylike(elems), ret = [];
            if (isArray) {
                for (; i < length; i++) {
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            } else {
                for (i in elems) {
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            }
            return concat.apply([], ret);
        },
        guid: 1,
        proxy: function (fn, context) {
            var tmp, args, proxy;
            if (typeof context === 'string') {
                tmp = fn[context];
                context = fn;
                fn = tmp;
            }
            if (!jQuery.isFunction(fn)) {
                return undefined;
            }
            args = slice.call(arguments, 2);
            proxy = function () {
                return fn.apply(context || this, args.concat(slice.call(arguments)));
            };
            proxy.guid = fn.guid = fn.guid || jQuery.guid++;
            return proxy;
        },
        now: Date.now,
        support: support
    });
    jQuery.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function (i, name) {
        class2type['[object ' + name + ']'] = name.toLowerCase();
    });
    function isArraylike(obj) {
        var length = 'length' in obj && obj.length, type = jQuery.type(obj);
        if (type === 'function' || jQuery.isWindow(obj)) {
            return false;
        }
        if (obj.nodeType === 1 && length) {
            return true;
        }
        return type === 'array' || length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj;
    }
    var Sizzle = function (window) {
        var i, support, Expr, getText, isXML, tokenize, compile, select, outermostContext, sortInput, hasDuplicate, setDocument, document, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, expando = 'sizzle' + 1 * new Date(), preferredDoc = window.document, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), sortOrder = function (a, b) {
                if (a === b) {
                    hasDuplicate = true;
                }
                return 0;
            }, MAX_NEGATIVE = 1 << 31, hasOwn = {}.hasOwnProperty, arr = [], pop = arr.pop, push_native = arr.push, push = arr.push, slice = arr.slice, indexOf = function (list, elem) {
                var i = 0, len = list.length;
                for (; i < len; i++) {
                    if (list[i] === elem) {
                        return i;
                    }
                }
                return -1;
            }, booleans = 'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped', whitespace = '[\\x20\\t\\r\\n\\f]', characterEncoding = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+', identifier = characterEncoding.replace('w', 'w#'), attributes = '\\[' + whitespace + '*(' + characterEncoding + ')(?:' + whitespace + '*([*^$|!~]?=)' + whitespace + '*(?:\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)"|(' + identifier + '))|)' + whitespace + '*\\]', pseudos = ':(' + characterEncoding + ')(?:\\((' + '(\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)")|' + '((?:\\\\.|[^\\\\()[\\]]|' + attributes + ')*)|' + '.*' + ')\\)|)', rwhitespace = new RegExp(whitespace + '+', 'g'), rtrim = new RegExp('^' + whitespace + '+|((?:^|[^\\\\])(?:\\\\.)*)' + whitespace + '+$', 'g'), rcomma = new RegExp('^' + whitespace + '*,' + whitespace + '*'), rcombinators = new RegExp('^' + whitespace + '*([>+~]|' + whitespace + ')' + whitespace + '*'), rattributeQuotes = new RegExp('=' + whitespace + '*([^\\]\'"]*?)' + whitespace + '*\\]', 'g'), rpseudo = new RegExp(pseudos), ridentifier = new RegExp('^' + identifier + '$'), matchExpr = {
                'ID': new RegExp('^#(' + characterEncoding + ')'),
                'CLASS': new RegExp('^\\.(' + characterEncoding + ')'),
                'TAG': new RegExp('^(' + characterEncoding.replace('w', 'w*') + ')'),
                'ATTR': new RegExp('^' + attributes),
                'PSEUDO': new RegExp('^' + pseudos),
                'CHILD': new RegExp('^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(' + whitespace + '*(even|odd|(([+-]|)(\\d*)n|)' + whitespace + '*(?:([+-]|)' + whitespace + '*(\\d+)|))' + whitespace + '*\\)|)', 'i'),
                'bool': new RegExp('^(?:' + booleans + ')$', 'i'),
                'needsContext': new RegExp('^' + whitespace + '*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(' + whitespace + '*((?:-\\d)?\\d*)' + whitespace + '*\\)|)(?=[^-]|$)', 'i')
            }, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rnative = /^[^{]+\{\s*\[native \w/, rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, rescape = /'|\\/g, runescape = new RegExp('\\\\([\\da-f]{1,6}' + whitespace + '?|(' + whitespace + ')|.)', 'ig'), funescape = function (_, escaped, escapedWhitespace) {
                var high = '0x' + escaped - 65536;
                return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
            }, unloadHandler = function () {
                setDocument();
            };
        try {
            push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes);
            arr[preferredDoc.childNodes.length].nodeType;
        } catch (e) {
            push = {
                apply: arr.length ? function (target, els) {
                    push_native.apply(target, slice.call(els));
                } : function (target, els) {
                    var j = target.length, i = 0;
                    while (target[j++] = els[i++]) {
                    }
                    target.length = j - 1;
                }
            };
        }
        function Sizzle(selector, context, results, seed) {
            var match, elem, m, nodeType, i, groups, old, nid, newContext, newSelector;
            if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
                setDocument(context);
            }
            context = context || document;
            results = results || [];
            nodeType = context.nodeType;
            if (typeof selector !== 'string' || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
                return results;
            }
            if (!seed && documentIsHTML) {
                if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
                    if (m = match[1]) {
                        if (nodeType === 9) {
                            elem = context.getElementById(m);
                            if (elem && elem.parentNode) {
                                if (elem.id === m) {
                                    results.push(elem);
                                    return results;
                                }
                            } else {
                                return results;
                            }
                        } else {
                            if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
                                results.push(elem);
                                return results;
                            }
                        }
                    } else if (match[2]) {
                        push.apply(results, context.getElementsByTagName(selector));
                        return results;
                    } else if ((m = match[3]) && support.getElementsByClassName) {
                        push.apply(results, context.getElementsByClassName(m));
                        return results;
                    }
                }
                if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                    nid = old = expando;
                    newContext = context;
                    newSelector = nodeType !== 1 && selector;
                    if (nodeType === 1 && context.nodeName.toLowerCase() !== 'object') {
                        groups = tokenize(selector);
                        if (old = context.getAttribute('id')) {
                            nid = old.replace(rescape, '\\$&');
                        } else {
                            context.setAttribute('id', nid);
                        }
                        nid = '[id=\'' + nid + '\'] ';
                        i = groups.length;
                        while (i--) {
                            groups[i] = nid + toSelector(groups[i]);
                        }
                        newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                        newSelector = groups.join(',');
                    }
                    if (newSelector) {
                        try {
                            push.apply(results, newContext.querySelectorAll(newSelector));
                            return results;
                        } catch (qsaError) {
                        } finally {
                            if (!old) {
                                context.removeAttribute('id');
                            }
                        }
                    }
                }
            }
            return select(selector.replace(rtrim, '$1'), context, results, seed);
        }
        function createCache() {
            var keys = [];
            function cache(key, value) {
                if (keys.push(key + ' ') > Expr.cacheLength) {
                    delete cache[keys.shift()];
                }
                return cache[key + ' '] = value;
            }
            return cache;
        }
        function markFunction(fn) {
            fn[expando] = true;
            return fn;
        }
        function assert(fn) {
            var div = document.createElement('div');
            try {
                return !!fn(div);
            } catch (e) {
                return false;
            } finally {
                if (div.parentNode) {
                    div.parentNode.removeChild(div);
                }
                div = null;
            }
        }
        function addHandle(attrs, handler) {
            var arr = attrs.split('|'), i = attrs.length;
            while (i--) {
                Expr.attrHandle[arr[i]] = handler;
            }
        }
        function siblingCheck(a, b) {
            var cur = b && a, diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
            if (diff) {
                return diff;
            }
            if (cur) {
                while (cur = cur.nextSibling) {
                    if (cur === b) {
                        return -1;
                    }
                }
            }
            return a ? 1 : -1;
        }
        function createInputPseudo(type) {
            return function (elem) {
                var name = elem.nodeName.toLowerCase();
                return name === 'input' && elem.type === type;
            };
        }
        function createButtonPseudo(type) {
            return function (elem) {
                var name = elem.nodeName.toLowerCase();
                return (name === 'input' || name === 'button') && elem.type === type;
            };
        }
        function createPositionalPseudo(fn) {
            return markFunction(function (argument) {
                argument = +argument;
                return markFunction(function (seed, matches) {
                    var j, matchIndexes = fn([], seed.length, argument), i = matchIndexes.length;
                    while (i--) {
                        if (seed[j = matchIndexes[i]]) {
                            seed[j] = !(matches[j] = seed[j]);
                        }
                    }
                });
            });
        }
        function testContext(context) {
            return context && typeof context.getElementsByTagName !== 'undefined' && context;
        }
        support = Sizzle.support = {};
        isXML = Sizzle.isXML = function (elem) {
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== 'HTML' : false;
        };
        setDocument = Sizzle.setDocument = function (node) {
            var hasCompare, parent, doc = node ? node.ownerDocument || node : preferredDoc;
            if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
                return document;
            }
            document = doc;
            docElem = doc.documentElement;
            parent = doc.defaultView;
            if (parent && parent !== parent.top) {
                if (parent.addEventListener) {
                    parent.addEventListener('unload', unloadHandler, false);
                } else if (parent.attachEvent) {
                    parent.attachEvent('onunload', unloadHandler);
                }
            }
            documentIsHTML = !isXML(doc);
            support.attributes = assert(function (div) {
                div.className = 'i';
                return !div.getAttribute('className');
            });
            support.getElementsByTagName = assert(function (div) {
                div.appendChild(doc.createComment(''));
                return !div.getElementsByTagName('*').length;
            });
            support.getElementsByClassName = rnative.test(doc.getElementsByClassName);
            support.getById = assert(function (div) {
                docElem.appendChild(div).id = expando;
                return !doc.getElementsByName || !doc.getElementsByName(expando).length;
            });
            if (support.getById) {
                Expr.find['ID'] = function (id, context) {
                    if (typeof context.getElementById !== 'undefined' && documentIsHTML) {
                        var m = context.getElementById(id);
                        return m && m.parentNode ? [m] : [];
                    }
                };
                Expr.filter['ID'] = function (id) {
                    var attrId = id.replace(runescape, funescape);
                    return function (elem) {
                        return elem.getAttribute('id') === attrId;
                    };
                };
            } else {
                delete Expr.find['ID'];
                Expr.filter['ID'] = function (id) {
                    var attrId = id.replace(runescape, funescape);
                    return function (elem) {
                        var node = typeof elem.getAttributeNode !== 'undefined' && elem.getAttributeNode('id');
                        return node && node.value === attrId;
                    };
                };
            }
            Expr.find['TAG'] = support.getElementsByTagName ? function (tag, context) {
                if (typeof context.getElementsByTagName !== 'undefined') {
                    return context.getElementsByTagName(tag);
                } else if (support.qsa) {
                    return context.querySelectorAll(tag);
                }
            } : function (tag, context) {
                var elem, tmp = [], i = 0, results = context.getElementsByTagName(tag);
                if (tag === '*') {
                    while (elem = results[i++]) {
                        if (elem.nodeType === 1) {
                            tmp.push(elem);
                        }
                    }
                    return tmp;
                }
                return results;
            };
            Expr.find['CLASS'] = support.getElementsByClassName && function (className, context) {
                if (documentIsHTML) {
                    return context.getElementsByClassName(className);
                }
            };
            rbuggyMatches = [];
            rbuggyQSA = [];
            if (support.qsa = rnative.test(doc.querySelectorAll)) {
                assert(function (div) {
                    docElem.appendChild(div).innerHTML = '<a id=\'' + expando + '\'></a>' + '<select id=\'' + expando + '-\f]\' msallowcapture=\'\'>' + '<option selected=\'\'></option></select>';
                    if (div.querySelectorAll('[msallowcapture^=\'\']').length) {
                        rbuggyQSA.push('[*^$]=' + whitespace + '*(?:\'\'|"")');
                    }
                    if (!div.querySelectorAll('[selected]').length) {
                        rbuggyQSA.push('\\[' + whitespace + '*(?:value|' + booleans + ')');
                    }
                    if (!div.querySelectorAll('[id~=' + expando + '-]').length) {
                        rbuggyQSA.push('~=');
                    }
                    if (!div.querySelectorAll(':checked').length) {
                        rbuggyQSA.push(':checked');
                    }
                    if (!div.querySelectorAll('a#' + expando + '+*').length) {
                        rbuggyQSA.push('.#.+[+~]');
                    }
                });
                assert(function (div) {
                    var input = doc.createElement('input');
                    input.setAttribute('type', 'hidden');
                    div.appendChild(input).setAttribute('name', 'D');
                    if (div.querySelectorAll('[name=d]').length) {
                        rbuggyQSA.push('name' + whitespace + '*[*^$|!~]?=');
                    }
                    if (!div.querySelectorAll(':enabled').length) {
                        rbuggyQSA.push(':enabled', ':disabled');
                    }
                    div.querySelectorAll('*,:x');
                    rbuggyQSA.push(',.*:');
                });
            }
            if (support.matchesSelector = rnative.test(matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {
                assert(function (div) {
                    support.disconnectedMatch = matches.call(div, 'div');
                    matches.call(div, '[s!=\'\']:x');
                    rbuggyMatches.push('!=', pseudos);
                });
            }
            rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join('|'));
            rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join('|'));
            hasCompare = rnative.test(docElem.compareDocumentPosition);
            contains = hasCompare || rnative.test(docElem.contains) ? function (a, b) {
                var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
                return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
            } : function (a, b) {
                if (b) {
                    while (b = b.parentNode) {
                        if (b === a) {
                            return true;
                        }
                    }
                }
                return false;
            };
            sortOrder = hasCompare ? function (a, b) {
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }
                var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                if (compare) {
                    return compare;
                }
                compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1;
                if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {
                    if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
                        return -1;
                    }
                    if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
                        return 1;
                    }
                    return sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;
                }
                return compare & 4 ? -1 : 1;
            } : function (a, b) {
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }
                var cur, i = 0, aup = a.parentNode, bup = b.parentNode, ap = [a], bp = [b];
                if (!aup || !bup) {
                    return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;
                } else if (aup === bup) {
                    return siblingCheck(a, b);
                }
                cur = a;
                while (cur = cur.parentNode) {
                    ap.unshift(cur);
                }
                cur = b;
                while (cur = cur.parentNode) {
                    bp.unshift(cur);
                }
                while (ap[i] === bp[i]) {
                    i++;
                }
                return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
            };
            return doc;
        };
        Sizzle.matches = function (expr, elements) {
            return Sizzle(expr, null, null, elements);
        };
        Sizzle.matchesSelector = function (elem, expr) {
            if ((elem.ownerDocument || elem) !== document) {
                setDocument(elem);
            }
            expr = expr.replace(rattributeQuotes, '=\'$1\']');
            if (support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
                try {
                    var ret = matches.call(elem, expr);
                    if (ret || support.disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
                        return ret;
                    }
                } catch (e) {
                }
            }
            return Sizzle(expr, document, null, [elem]).length > 0;
        };
        Sizzle.contains = function (context, elem) {
            if ((context.ownerDocument || context) !== document) {
                setDocument(context);
            }
            return contains(context, elem);
        };
        Sizzle.attr = function (elem, name) {
            if ((elem.ownerDocument || elem) !== document) {
                setDocument(elem);
            }
            var fn = Expr.attrHandle[name.toLowerCase()], val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;
            return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
        };
        Sizzle.error = function (msg) {
            throw new Error('Syntax error, unrecognized expression: ' + msg);
        };
        Sizzle.uniqueSort = function (results) {
            var elem, duplicates = [], j = 0, i = 0;
            hasDuplicate = !support.detectDuplicates;
            sortInput = !support.sortStable && results.slice(0);
            results.sort(sortOrder);
            if (hasDuplicate) {
                while (elem = results[i++]) {
                    if (elem === results[i]) {
                        j = duplicates.push(i);
                    }
                }
                while (j--) {
                    results.splice(duplicates[j], 1);
                }
            }
            sortInput = null;
            return results;
        };
        getText = Sizzle.getText = function (elem) {
            var node, ret = '', i = 0, nodeType = elem.nodeType;
            if (!nodeType) {
                while (node = elem[i++]) {
                    ret += getText(node);
                }
            } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                if (typeof elem.textContent === 'string') {
                    return elem.textContent;
                } else {
                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        ret += getText(elem);
                    }
                }
            } else if (nodeType === 3 || nodeType === 4) {
                return elem.nodeValue;
            }
            return ret;
        };
        Expr = Sizzle.selectors = {
            cacheLength: 50,
            createPseudo: markFunction,
            match: matchExpr,
            attrHandle: {},
            find: {},
            relative: {
                '>': {
                    dir: 'parentNode',
                    first: true
                },
                ' ': { dir: 'parentNode' },
                '+': {
                    dir: 'previousSibling',
                    first: true
                },
                '~': { dir: 'previousSibling' }
            },
            preFilter: {
                'ATTR': function (match) {
                    match[1] = match[1].replace(runescape, funescape);
                    match[3] = (match[3] || match[4] || match[5] || '').replace(runescape, funescape);
                    if (match[2] === '~=') {
                        match[3] = ' ' + match[3] + ' ';
                    }
                    return match.slice(0, 4);
                },
                'CHILD': function (match) {
                    match[1] = match[1].toLowerCase();
                    if (match[1].slice(0, 3) === 'nth') {
                        if (!match[3]) {
                            Sizzle.error(match[0]);
                        }
                        match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === 'even' || match[3] === 'odd'));
                        match[5] = +(match[7] + match[8] || match[3] === 'odd');
                    } else if (match[3]) {
                        Sizzle.error(match[0]);
                    }
                    return match;
                },
                'PSEUDO': function (match) {
                    var excess, unquoted = !match[6] && match[2];
                    if (matchExpr['CHILD'].test(match[0])) {
                        return null;
                    }
                    if (match[3]) {
                        match[2] = match[4] || match[5] || '';
                    } else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, true)) && (excess = unquoted.indexOf(')', unquoted.length - excess) - unquoted.length)) {
                        match[0] = match[0].slice(0, excess);
                        match[2] = unquoted.slice(0, excess);
                    }
                    return match.slice(0, 3);
                }
            },
            filter: {
                'TAG': function (nodeNameSelector) {
                    var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                    return nodeNameSelector === '*' ? function () {
                        return true;
                    } : function (elem) {
                        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                    };
                },
                'CLASS': function (className) {
                    var pattern = classCache[className + ' '];
                    return pattern || (pattern = new RegExp('(^|' + whitespace + ')' + className + '(' + whitespace + '|$)')) && classCache(className, function (elem) {
                        return pattern.test(typeof elem.className === 'string' && elem.className || typeof elem.getAttribute !== 'undefined' && elem.getAttribute('class') || '');
                    });
                },
                'ATTR': function (name, operator, check) {
                    return function (elem) {
                        var result = Sizzle.attr(elem, name);
                        if (result == null) {
                            return operator === '!=';
                        }
                        if (!operator) {
                            return true;
                        }
                        result += '';
                        return operator === '=' ? result === check : operator === '!=' ? result !== check : operator === '^=' ? check && result.indexOf(check) === 0 : operator === '*=' ? check && result.indexOf(check) > -1 : operator === '$=' ? check && result.slice(-check.length) === check : operator === '~=' ? (' ' + result.replace(rwhitespace, ' ') + ' ').indexOf(check) > -1 : operator === '|=' ? result === check || result.slice(0, check.length + 1) === check + '-' : false;
                    };
                },
                'CHILD': function (type, what, argument, first, last) {
                    var simple = type.slice(0, 3) !== 'nth', forward = type.slice(-4) !== 'last', ofType = what === 'of-type';
                    return first === 1 && last === 0 ? function (elem) {
                        return !!elem.parentNode;
                    } : function (elem, context, xml) {
                        var cache, outerCache, node, diff, nodeIndex, start, dir = simple !== forward ? 'nextSibling' : 'previousSibling', parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType;
                        if (parent) {
                            if (simple) {
                                while (dir) {
                                    node = elem;
                                    while (node = node[dir]) {
                                        if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                                            return false;
                                        }
                                    }
                                    start = dir = type === 'only' && !start && 'nextSibling';
                                }
                                return true;
                            }
                            start = [forward ? parent.firstChild : parent.lastChild];
                            if (forward && useCache) {
                                outerCache = parent[expando] || (parent[expando] = {});
                                cache = outerCache[type] || [];
                                nodeIndex = cache[0] === dirruns && cache[1];
                                diff = cache[0] === dirruns && cache[2];
                                node = nodeIndex && parent.childNodes[nodeIndex];
                                while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                                    if (node.nodeType === 1 && ++diff && node === elem) {
                                        outerCache[type] = [
                                            dirruns,
                                            nodeIndex,
                                            diff
                                        ];
                                        break;
                                    }
                                }
                            } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
                                diff = cache[1];
                            } else {
                                while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                                    if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                                        if (useCache) {
                                            (node[expando] || (node[expando] = {}))[type] = [
                                                dirruns,
                                                diff
                                            ];
                                        }
                                        if (node === elem) {
                                            break;
                                        }
                                    }
                                }
                            }
                            diff -= last;
                            return diff === first || diff % first === 0 && diff / first >= 0;
                        }
                    };
                },
                'PSEUDO': function (pseudo, argument) {
                    var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error('unsupported pseudo: ' + pseudo);
                    if (fn[expando]) {
                        return fn(argument);
                    }
                    if (fn.length > 1) {
                        args = [
                            pseudo,
                            pseudo,
                            '',
                            argument
                        ];
                        return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function (seed, matches) {
                            var idx, matched = fn(seed, argument), i = matched.length;
                            while (i--) {
                                idx = indexOf(seed, matched[i]);
                                seed[idx] = !(matches[idx] = matched[i]);
                            }
                        }) : function (elem) {
                            return fn(elem, 0, args);
                        };
                    }
                    return fn;
                }
            },
            pseudos: {
                'not': markFunction(function (selector) {
                    var input = [], results = [], matcher = compile(selector.replace(rtrim, '$1'));
                    return matcher[expando] ? markFunction(function (seed, matches, context, xml) {
                        var elem, unmatched = matcher(seed, null, xml, []), i = seed.length;
                        while (i--) {
                            if (elem = unmatched[i]) {
                                seed[i] = !(matches[i] = elem);
                            }
                        }
                    }) : function (elem, context, xml) {
                        input[0] = elem;
                        matcher(input, null, xml, results);
                        input[0] = null;
                        return !results.pop();
                    };
                }),
                'has': markFunction(function (selector) {
                    return function (elem) {
                        return Sizzle(selector, elem).length > 0;
                    };
                }),
                'contains': markFunction(function (text) {
                    text = text.replace(runescape, funescape);
                    return function (elem) {
                        return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
                    };
                }),
                'lang': markFunction(function (lang) {
                    if (!ridentifier.test(lang || '')) {
                        Sizzle.error('unsupported lang: ' + lang);
                    }
                    lang = lang.replace(runescape, funescape).toLowerCase();
                    return function (elem) {
                        var elemLang;
                        do {
                            if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute('xml:lang') || elem.getAttribute('lang')) {
                                elemLang = elemLang.toLowerCase();
                                return elemLang === lang || elemLang.indexOf(lang + '-') === 0;
                            }
                        } while ((elem = elem.parentNode) && elem.nodeType === 1);
                        return false;
                    };
                }),
                'target': function (elem) {
                    var hash = window.location && window.location.hash;
                    return hash && hash.slice(1) === elem.id;
                },
                'root': function (elem) {
                    return elem === docElem;
                },
                'focus': function (elem) {
                    return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
                },
                'enabled': function (elem) {
                    return elem.disabled === false;
                },
                'disabled': function (elem) {
                    return elem.disabled === true;
                },
                'checked': function (elem) {
                    var nodeName = elem.nodeName.toLowerCase();
                    return nodeName === 'input' && !!elem.checked || nodeName === 'option' && !!elem.selected;
                },
                'selected': function (elem) {
                    if (elem.parentNode) {
                        elem.parentNode.selectedIndex;
                    }
                    return elem.selected === true;
                },
                'empty': function (elem) {
                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        if (elem.nodeType < 6) {
                            return false;
                        }
                    }
                    return true;
                },
                'parent': function (elem) {
                    return !Expr.pseudos['empty'](elem);
                },
                'header': function (elem) {
                    return rheader.test(elem.nodeName);
                },
                'input': function (elem) {
                    return rinputs.test(elem.nodeName);
                },
                'button': function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return name === 'input' && elem.type === 'button' || name === 'button';
                },
                'text': function (elem) {
                    var attr;
                    return elem.nodeName.toLowerCase() === 'input' && elem.type === 'text' && ((attr = elem.getAttribute('type')) == null || attr.toLowerCase() === 'text');
                },
                'first': createPositionalPseudo(function () {
                    return [0];
                }),
                'last': createPositionalPseudo(function (matchIndexes, length) {
                    return [length - 1];
                }),
                'eq': createPositionalPseudo(function (matchIndexes, length, argument) {
                    return [argument < 0 ? argument + length : argument];
                }),
                'even': createPositionalPseudo(function (matchIndexes, length) {
                    var i = 0;
                    for (; i < length; i += 2) {
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                }),
                'odd': createPositionalPseudo(function (matchIndexes, length) {
                    var i = 1;
                    for (; i < length; i += 2) {
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                }),
                'lt': createPositionalPseudo(function (matchIndexes, length, argument) {
                    var i = argument < 0 ? argument + length : argument;
                    for (; --i >= 0;) {
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                }),
                'gt': createPositionalPseudo(function (matchIndexes, length, argument) {
                    var i = argument < 0 ? argument + length : argument;
                    for (; ++i < length;) {
                        matchIndexes.push(i);
                    }
                    return matchIndexes;
                })
            }
        };
        Expr.pseudos['nth'] = Expr.pseudos['eq'];
        for (i in {
                radio: true,
                checkbox: true,
                file: true,
                password: true,
                image: true
            }) {
            Expr.pseudos[i] = createInputPseudo(i);
        }
        for (i in {
                submit: true,
                reset: true
            }) {
            Expr.pseudos[i] = createButtonPseudo(i);
        }
        function setFilters() {
        }
        setFilters.prototype = Expr.filters = Expr.pseudos;
        Expr.setFilters = new setFilters();
        tokenize = Sizzle.tokenize = function (selector, parseOnly) {
            var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + ' '];
            if (cached) {
                return parseOnly ? 0 : cached.slice(0);
            }
            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;
            while (soFar) {
                if (!matched || (match = rcomma.exec(soFar))) {
                    if (match) {
                        soFar = soFar.slice(match[0].length) || soFar;
                    }
                    groups.push(tokens = []);
                }
                matched = false;
                if (match = rcombinators.exec(soFar)) {
                    matched = match.shift();
                    tokens.push({
                        value: matched,
                        type: match[0].replace(rtrim, ' ')
                    });
                    soFar = soFar.slice(matched.length);
                }
                for (type in Expr.filter) {
                    if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                        matched = match.shift();
                        tokens.push({
                            value: matched,
                            type: type,
                            matches: match
                        });
                        soFar = soFar.slice(matched.length);
                    }
                }
                if (!matched) {
                    break;
                }
            }
            return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0);
        };
        function toSelector(tokens) {
            var i = 0, len = tokens.length, selector = '';
            for (; i < len; i++) {
                selector += tokens[i].value;
            }
            return selector;
        }
        function addCombinator(matcher, combinator, base) {
            var dir = combinator.dir, checkNonElements = base && dir === 'parentNode', doneName = done++;
            return combinator.first ? function (elem, context, xml) {
                while (elem = elem[dir]) {
                    if (elem.nodeType === 1 || checkNonElements) {
                        return matcher(elem, context, xml);
                    }
                }
            } : function (elem, context, xml) {
                var oldCache, outerCache, newCache = [
                        dirruns,
                        doneName
                    ];
                if (xml) {
                    while (elem = elem[dir]) {
                        if (elem.nodeType === 1 || checkNonElements) {
                            if (matcher(elem, context, xml)) {
                                return true;
                            }
                        }
                    }
                } else {
                    while (elem = elem[dir]) {
                        if (elem.nodeType === 1 || checkNonElements) {
                            outerCache = elem[expando] || (elem[expando] = {});
                            if ((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                                return newCache[2] = oldCache[2];
                            } else {
                                outerCache[dir] = newCache;
                                if (newCache[2] = matcher(elem, context, xml)) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            };
        }
        function elementMatcher(matchers) {
            return matchers.length > 1 ? function (elem, context, xml) {
                var i = matchers.length;
                while (i--) {
                    if (!matchers[i](elem, context, xml)) {
                        return false;
                    }
                }
                return true;
            } : matchers[0];
        }
        function multipleContexts(selector, contexts, results) {
            var i = 0, len = contexts.length;
            for (; i < len; i++) {
                Sizzle(selector, contexts[i], results);
            }
            return results;
        }
        function condense(unmatched, map, filter, context, xml) {
            var elem, newUnmatched = [], i = 0, len = unmatched.length, mapped = map != null;
            for (; i < len; i++) {
                if (elem = unmatched[i]) {
                    if (!filter || filter(elem, context, xml)) {
                        newUnmatched.push(elem);
                        if (mapped) {
                            map.push(i);
                        }
                    }
                }
            }
            return newUnmatched;
        }
        function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
            if (postFilter && !postFilter[expando]) {
                postFilter = setMatcher(postFilter);
            }
            if (postFinder && !postFinder[expando]) {
                postFinder = setMatcher(postFinder, postSelector);
            }
            return markFunction(function (seed, results, context, xml) {
                var temp, i, elem, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(selector || '*', context.nodeType ? [context] : context, []), matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems, matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
                if (matcher) {
                    matcher(matcherIn, matcherOut, context, xml);
                }
                if (postFilter) {
                    temp = condense(matcherOut, postMap);
                    postFilter(temp, [], context, xml);
                    i = temp.length;
                    while (i--) {
                        if (elem = temp[i]) {
                            matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
                        }
                    }
                }
                if (seed) {
                    if (postFinder || preFilter) {
                        if (postFinder) {
                            temp = [];
                            i = matcherOut.length;
                            while (i--) {
                                if (elem = matcherOut[i]) {
                                    temp.push(matcherIn[i] = elem);
                                }
                            }
                            postFinder(null, matcherOut = [], temp, xml);
                        }
                        i = matcherOut.length;
                        while (i--) {
                            if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {
                                seed[temp] = !(results[temp] = elem);
                            }
                        }
                    }
                } else {
                    matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
                    if (postFinder) {
                        postFinder(null, results, matcherOut, xml);
                    } else {
                        push.apply(results, matcherOut);
                    }
                }
            });
        }
        function matcherFromTokens(tokens) {
            var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[' '], i = leadingRelative ? 1 : 0, matchContext = addCombinator(function (elem) {
                    return elem === checkContext;
                }, implicitRelative, true), matchAnyContext = addCombinator(function (elem) {
                    return indexOf(checkContext, elem) > -1;
                }, implicitRelative, true), matchers = [function (elem, context, xml) {
                        var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
                        checkContext = null;
                        return ret;
                    }];
            for (; i < len; i++) {
                if (matcher = Expr.relative[tokens[i].type]) {
                    matchers = [addCombinator(elementMatcher(matchers), matcher)];
                } else {
                    matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);
                    if (matcher[expando]) {
                        j = ++i;
                        for (; j < len; j++) {
                            if (Expr.relative[tokens[j].type]) {
                                break;
                            }
                        }
                        return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({ value: tokens[i - 2].type === ' ' ? '*' : '' })).replace(rtrim, '$1'), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
                    }
                    matchers.push(matcher);
                }
            }
            return elementMatcher(matchers);
        }
        function matcherFromGroupMatchers(elementMatchers, setMatchers) {
            var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function (seed, context, xml, results, outermost) {
                    var elem, j, matcher, matchedCount = 0, i = '0', unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && Expr.find['TAG']('*', outermost), dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1, len = elems.length;
                    if (outermost) {
                        outermostContext = context !== document && context;
                    }
                    for (; i !== len && (elem = elems[i]) != null; i++) {
                        if (byElement && elem) {
                            j = 0;
                            while (matcher = elementMatchers[j++]) {
                                if (matcher(elem, context, xml)) {
                                    results.push(elem);
                                    break;
                                }
                            }
                            if (outermost) {
                                dirruns = dirrunsUnique;
                            }
                        }
                        if (bySet) {
                            if (elem = !matcher && elem) {
                                matchedCount--;
                            }
                            if (seed) {
                                unmatched.push(elem);
                            }
                        }
                    }
                    matchedCount += i;
                    if (bySet && i !== matchedCount) {
                        j = 0;
                        while (matcher = setMatchers[j++]) {
                            matcher(unmatched, setMatched, context, xml);
                        }
                        if (seed) {
                            if (matchedCount > 0) {
                                while (i--) {
                                    if (!(unmatched[i] || setMatched[i])) {
                                        setMatched[i] = pop.call(results);
                                    }
                                }
                            }
                            setMatched = condense(setMatched);
                        }
                        push.apply(results, setMatched);
                        if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
                            Sizzle.uniqueSort(results);
                        }
                    }
                    if (outermost) {
                        dirruns = dirrunsUnique;
                        outermostContext = contextBackup;
                    }
                    return unmatched;
                };
            return bySet ? markFunction(superMatcher) : superMatcher;
        }
        compile = Sizzle.compile = function (selector, match) {
            var i, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + ' '];
            if (!cached) {
                if (!match) {
                    match = tokenize(selector);
                }
                i = match.length;
                while (i--) {
                    cached = matcherFromTokens(match[i]);
                    if (cached[expando]) {
                        setMatchers.push(cached);
                    } else {
                        elementMatchers.push(cached);
                    }
                }
                cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
                cached.selector = selector;
            }
            return cached;
        };
        select = Sizzle.select = function (selector, context, results, seed) {
            var i, tokens, token, type, find, compiled = typeof selector === 'function' && selector, match = !seed && tokenize(selector = compiled.selector || selector);
            results = results || [];
            if (match.length === 1) {
                tokens = match[0] = match[0].slice(0);
                if (tokens.length > 2 && (token = tokens[0]).type === 'ID' && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
                    context = (Expr.find['ID'](token.matches[0].replace(runescape, funescape), context) || [])[0];
                    if (!context) {
                        return results;
                    } else if (compiled) {
                        context = context.parentNode;
                    }
                    selector = selector.slice(tokens.shift().value.length);
                }
                i = matchExpr['needsContext'].test(selector) ? 0 : tokens.length;
                while (i--) {
                    token = tokens[i];
                    if (Expr.relative[type = token.type]) {
                        break;
                    }
                    if (find = Expr.find[type]) {
                        if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {
                            tokens.splice(i, 1);
                            selector = seed.length && toSelector(tokens);
                            if (!selector) {
                                push.apply(results, seed);
                                return results;
                            }
                            break;
                        }
                    }
                }
            }
            (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context);
            return results;
        };
        support.sortStable = expando.split('').sort(sortOrder).join('') === expando;
        support.detectDuplicates = !!hasDuplicate;
        setDocument();
        support.sortDetached = assert(function (div1) {
            return div1.compareDocumentPosition(document.createElement('div')) & 1;
        });
        if (!assert(function (div) {
                div.innerHTML = '<a href=\'#\'></a>';
                return div.firstChild.getAttribute('href') === '#';
            })) {
            addHandle('type|href|height|width', function (elem, name, isXML) {
                if (!isXML) {
                    return elem.getAttribute(name, name.toLowerCase() === 'type' ? 1 : 2);
                }
            });
        }
        if (!support.attributes || !assert(function (div) {
                div.innerHTML = '<input/>';
                div.firstChild.setAttribute('value', '');
                return div.firstChild.getAttribute('value') === '';
            })) {
            addHandle('value', function (elem, name, isXML) {
                if (!isXML && elem.nodeName.toLowerCase() === 'input') {
                    return elem.defaultValue;
                }
            });
        }
        if (!assert(function (div) {
                return div.getAttribute('disabled') == null;
            })) {
            addHandle(booleans, function (elem, name, isXML) {
                var val;
                if (!isXML) {
                    return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
                }
            });
        }
        return Sizzle;
    }(window);
    jQuery.find = Sizzle;
    jQuery.expr = Sizzle.selectors;
    jQuery.expr[':'] = jQuery.expr.pseudos;
    jQuery.unique = Sizzle.uniqueSort;
    jQuery.text = Sizzle.getText;
    jQuery.isXMLDoc = Sizzle.isXML;
    jQuery.contains = Sizzle.contains;
    var rneedsContext = jQuery.expr.match.needsContext;
    var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
    var risSimple = /^.[^:#\[\.,]*$/;
    function winnow(elements, qualifier, not) {
        if (jQuery.isFunction(qualifier)) {
            return jQuery.grep(elements, function (elem, i) {
                return !!qualifier.call(elem, i, elem) !== not;
            });
        }
        if (qualifier.nodeType) {
            return jQuery.grep(elements, function (elem) {
                return elem === qualifier !== not;
            });
        }
        if (typeof qualifier === 'string') {
            if (risSimple.test(qualifier)) {
                return jQuery.filter(qualifier, elements, not);
            }
            qualifier = jQuery.filter(qualifier, elements);
        }
        return jQuery.grep(elements, function (elem) {
            return indexOf.call(qualifier, elem) >= 0 !== not;
        });
    }
    jQuery.filter = function (expr, elems, not) {
        var elem = elems[0];
        if (not) {
            expr = ':not(' + expr + ')';
        }
        return elems.length === 1 && elem.nodeType === 1 ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function (elem) {
            return elem.nodeType === 1;
        }));
    };
    jQuery.fn.extend({
        find: function (selector) {
            var i, len = this.length, ret = [], self = this;
            if (typeof selector !== 'string') {
                return this.pushStack(jQuery(selector).filter(function () {
                    for (i = 0; i < len; i++) {
                        if (jQuery.contains(self[i], this)) {
                            return true;
                        }
                    }
                }));
            }
            for (i = 0; i < len; i++) {
                jQuery.find(selector, self[i], ret);
            }
            ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
            ret.selector = this.selector ? this.selector + ' ' + selector : selector;
            return ret;
        },
        filter: function (selector) {
            return this.pushStack(winnow(this, selector || [], false));
        },
        not: function (selector) {
            return this.pushStack(winnow(this, selector || [], true));
        },
        is: function (selector) {
            return !!winnow(this, typeof selector === 'string' && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
        }
    });
    var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, init = jQuery.fn.init = function (selector, context) {
            var match, elem;
            if (!selector) {
                return this;
            }
            if (typeof selector === 'string') {
                if (selector[0] === '<' && selector[selector.length - 1] === '>' && selector.length >= 3) {
                    match = [
                        null,
                        selector,
                        null
                    ];
                } else {
                    match = rquickExpr.exec(selector);
                }
                if (match && (match[1] || !context)) {
                    if (match[1]) {
                        context = context instanceof jQuery ? context[0] : context;
                        jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));
                        if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                            for (match in context) {
                                if (jQuery.isFunction(this[match])) {
                                    this[match](context[match]);
                                } else {
                                    this.attr(match, context[match]);
                                }
                            }
                        }
                        return this;
                    } else {
                        elem = document.getElementById(match[2]);
                        if (elem && elem.parentNode) {
                            this.length = 1;
                            this[0] = elem;
                        }
                        this.context = document;
                        this.selector = selector;
                        return this;
                    }
                } else if (!context || context.jquery) {
                    return (context || rootjQuery).find(selector);
                } else {
                    return this.constructor(context).find(selector);
                }
            } else if (selector.nodeType) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            } else if (jQuery.isFunction(selector)) {
                return typeof rootjQuery.ready !== 'undefined' ? rootjQuery.ready(selector) : selector(jQuery);
            }
            if (selector.selector !== undefined) {
                this.selector = selector.selector;
                this.context = selector.context;
            }
            return jQuery.makeArray(selector, this);
        };
    init.prototype = jQuery.fn;
    rootjQuery = jQuery(document);
    var rparentsprev = /^(?:parents|prev(?:Until|All))/, guaranteedUnique = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };
    jQuery.extend({
        dir: function (elem, dir, until) {
            var matched = [], truncate = until !== undefined;
            while ((elem = elem[dir]) && elem.nodeType !== 9) {
                if (elem.nodeType === 1) {
                    if (truncate && jQuery(elem).is(until)) {
                        break;
                    }
                    matched.push(elem);
                }
            }
            return matched;
        },
        sibling: function (n, elem) {
            var matched = [];
            for (; n; n = n.nextSibling) {
                if (n.nodeType === 1 && n !== elem) {
                    matched.push(n);
                }
            }
            return matched;
        }
    });
    jQuery.fn.extend({
        has: function (target) {
            var targets = jQuery(target, this), l = targets.length;
            return this.filter(function () {
                var i = 0;
                for (; i < l; i++) {
                    if (jQuery.contains(this, targets[i])) {
                        return true;
                    }
                }
            });
        },
        closest: function (selectors, context) {
            var cur, i = 0, l = this.length, matched = [], pos = rneedsContext.test(selectors) || typeof selectors !== 'string' ? jQuery(selectors, context || this.context) : 0;
            for (; i < l; i++) {
                for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
                    if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {
                        matched.push(cur);
                        break;
                    }
                }
            }
            return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
        },
        index: function (elem) {
            if (!elem) {
                return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
            }
            if (typeof elem === 'string') {
                return indexOf.call(jQuery(elem), this[0]);
            }
            return indexOf.call(this, elem.jquery ? elem[0] : elem);
        },
        add: function (selector, context) {
            return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))));
        },
        addBack: function (selector) {
            return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
        }
    });
    function sibling(cur, dir) {
        while ((cur = cur[dir]) && cur.nodeType !== 1) {
        }
        return cur;
    }
    jQuery.each({
        parent: function (elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        },
        parents: function (elem) {
            return jQuery.dir(elem, 'parentNode');
        },
        parentsUntil: function (elem, i, until) {
            return jQuery.dir(elem, 'parentNode', until);
        },
        next: function (elem) {
            return sibling(elem, 'nextSibling');
        },
        prev: function (elem) {
            return sibling(elem, 'previousSibling');
        },
        nextAll: function (elem) {
            return jQuery.dir(elem, 'nextSibling');
        },
        prevAll: function (elem) {
            return jQuery.dir(elem, 'previousSibling');
        },
        nextUntil: function (elem, i, until) {
            return jQuery.dir(elem, 'nextSibling', until);
        },
        prevUntil: function (elem, i, until) {
            return jQuery.dir(elem, 'previousSibling', until);
        },
        siblings: function (elem) {
            return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
        },
        children: function (elem) {
            return jQuery.sibling(elem.firstChild);
        },
        contents: function (elem) {
            return elem.contentDocument || jQuery.merge([], elem.childNodes);
        }
    }, function (name, fn) {
        jQuery.fn[name] = function (until, selector) {
            var matched = jQuery.map(this, fn, until);
            if (name.slice(-5) !== 'Until') {
                selector = until;
            }
            if (selector && typeof selector === 'string') {
                matched = jQuery.filter(selector, matched);
            }
            if (this.length > 1) {
                if (!guaranteedUnique[name]) {
                    jQuery.unique(matched);
                }
                if (rparentsprev.test(name)) {
                    matched.reverse();
                }
            }
            return this.pushStack(matched);
        };
    });
    var rnotwhite = /\S+/g;
    var optionsCache = {};
    function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.match(rnotwhite) || [], function (_, flag) {
            object[flag] = true;
        });
        return object;
    }
    jQuery.Callbacks = function (options) {
        options = typeof options === 'string' ? optionsCache[options] || createOptions(options) : jQuery.extend({}, options);
        var memory, fired, firing, firingStart, firingLength, firingIndex, list = [], stack = !options.once && [], fire = function (data) {
                memory = options.memory && data;
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                firing = true;
                for (; list && firingIndex < firingLength; firingIndex++) {
                    if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                        memory = false;
                        break;
                    }
                }
                firing = false;
                if (list) {
                    if (stack) {
                        if (stack.length) {
                            fire(stack.shift());
                        }
                    } else if (memory) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            }, self = {
                add: function () {
                    if (list) {
                        var start = list.length;
                        (function add(args) {
                            jQuery.each(args, function (_, arg) {
                                var type = jQuery.type(arg);
                                if (type === 'function') {
                                    if (!options.unique || !self.has(arg)) {
                                        list.push(arg);
                                    }
                                } else if (arg && arg.length && type !== 'string') {
                                    add(arg);
                                }
                            });
                        }(arguments));
                        if (firing) {
                            firingLength = list.length;
                        } else if (memory) {
                            firingStart = start;
                            fire(memory);
                        }
                    }
                    return this;
                },
                remove: function () {
                    if (list) {
                        jQuery.each(arguments, function (_, arg) {
                            var index;
                            while ((index = jQuery.inArray(arg, list, index)) > -1) {
                                list.splice(index, 1);
                                if (firing) {
                                    if (index <= firingLength) {
                                        firingLength--;
                                    }
                                    if (index <= firingIndex) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                has: function (fn) {
                    return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
                },
                empty: function () {
                    list = [];
                    firingLength = 0;
                    return this;
                },
                disable: function () {
                    list = stack = memory = undefined;
                    return this;
                },
                disabled: function () {
                    return !list;
                },
                lock: function () {
                    stack = undefined;
                    if (!memory) {
                        self.disable();
                    }
                    return this;
                },
                locked: function () {
                    return !stack;
                },
                fireWith: function (context, args) {
                    if (list && (!fired || stack)) {
                        args = args || [];
                        args = [
                            context,
                            args.slice ? args.slice() : args
                        ];
                        if (firing) {
                            stack.push(args);
                        } else {
                            fire(args);
                        }
                    }
                    return this;
                },
                fire: function () {
                    self.fireWith(this, arguments);
                    return this;
                },
                fired: function () {
                    return !!fired;
                }
            };
        return self;
    };
    jQuery.extend({
        Deferred: function (func) {
            var tuples = [
                    [
                        'resolve',
                        'done',
                        jQuery.Callbacks('once memory'),
                        'resolved'
                    ],
                    [
                        'reject',
                        'fail',
                        jQuery.Callbacks('once memory'),
                        'rejected'
                    ],
                    [
                        'notify',
                        'progress',
                        jQuery.Callbacks('memory')
                    ]
                ], state = 'pending', promise = {
                    state: function () {
                        return state;
                    },
                    always: function () {
                        deferred.done(arguments).fail(arguments);
                        return this;
                    },
                    then: function () {
                        var fns = arguments;
                        return jQuery.Deferred(function (newDefer) {
                            jQuery.each(tuples, function (i, tuple) {
                                var fn = jQuery.isFunction(fns[i]) && fns[i];
                                deferred[tuple[1]](function () {
                                    var returned = fn && fn.apply(this, arguments);
                                    if (returned && jQuery.isFunction(returned.promise)) {
                                        returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
                                    } else {
                                        newDefer[tuple[0] + 'With'](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
                                    }
                                });
                            });
                            fns = null;
                        }).promise();
                    },
                    promise: function (obj) {
                        return obj != null ? jQuery.extend(obj, promise) : promise;
                    }
                }, deferred = {};
            promise.pipe = promise.then;
            jQuery.each(tuples, function (i, tuple) {
                var list = tuple[2], stateString = tuple[3];
                promise[tuple[1]] = list.add;
                if (stateString) {
                    list.add(function () {
                        state = stateString;
                    }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
                }
                deferred[tuple[0]] = function () {
                    deferred[tuple[0] + 'With'](this === deferred ? promise : this, arguments);
                    return this;
                };
                deferred[tuple[0] + 'With'] = list.fireWith;
            });
            promise.promise(deferred);
            if (func) {
                func.call(deferred, deferred);
            }
            return deferred;
        },
        when: function (subordinate) {
            var i = 0, resolveValues = slice.call(arguments), length = resolveValues.length, remaining = length !== 1 || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0, deferred = remaining === 1 ? subordinate : jQuery.Deferred(), updateFunc = function (i, contexts, values) {
                    return function (value) {
                        contexts[i] = this;
                        values[i] = arguments.length > 1 ? slice.call(arguments) : value;
                        if (values === progressValues) {
                            deferred.notifyWith(contexts, values);
                        } else if (!--remaining) {
                            deferred.resolveWith(contexts, values);
                        }
                    };
                }, progressValues, progressContexts, resolveContexts;
            if (length > 1) {
                progressValues = new Array(length);
                progressContexts = new Array(length);
                resolveContexts = new Array(length);
                for (; i < length; i++) {
                    if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
                        resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
                    } else {
                        --remaining;
                    }
                }
            }
            if (!remaining) {
                deferred.resolveWith(resolveContexts, resolveValues);
            }
            return deferred.promise();
        }
    });
    var readyList;
    jQuery.fn.ready = function (fn) {
        jQuery.ready.promise().done(fn);
        return this;
    };
    jQuery.extend({
        isReady: false,
        readyWait: 1,
        holdReady: function (hold) {
            if (hold) {
                jQuery.readyWait++;
            } else {
                jQuery.ready(true);
            }
        },
        ready: function (wait) {
            if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
                return;
            }
            jQuery.isReady = true;
            if (wait !== true && --jQuery.readyWait > 0) {
                return;
            }
            readyList.resolveWith(document, [jQuery]);
            if (jQuery.fn.triggerHandler) {
                jQuery(document).triggerHandler('ready');
                jQuery(document).off('ready');
            }
        }
    });
    function completed() {
        document.removeEventListener('DOMContentLoaded', completed, false);
        window.removeEventListener('load', completed, false);
        jQuery.ready();
    }
    jQuery.ready.promise = function (obj) {
        if (!readyList) {
            readyList = jQuery.Deferred();
            if (document.readyState === 'complete') {
                setTimeout(jQuery.ready);
            } else {
                document.addEventListener('DOMContentLoaded', completed, false);
                window.addEventListener('load', completed, false);
            }
        }
        return readyList.promise(obj);
    };
    jQuery.ready.promise();
    var access = jQuery.access = function (elems, fn, key, value, chainable, emptyGet, raw) {
        var i = 0, len = elems.length, bulk = key == null;
        if (jQuery.type(key) === 'object') {
            chainable = true;
            for (i in key) {
                jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
            }
        } else if (value !== undefined) {
            chainable = true;
            if (!jQuery.isFunction(value)) {
                raw = true;
            }
            if (bulk) {
                if (raw) {
                    fn.call(elems, value);
                    fn = null;
                } else {
                    bulk = fn;
                    fn = function (elem, key, value) {
                        return bulk.call(jQuery(elem), value);
                    };
                }
            }
            if (fn) {
                for (; i < len; i++) {
                    fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
                }
            }
        }
        return chainable ? elems : bulk ? fn.call(elems) : len ? fn(elems[0], key) : emptyGet;
    };
    jQuery.acceptData = function (owner) {
        return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
    };
    function Data() {
        Object.defineProperty(this.cache = {}, 0, {
            get: function () {
                return {};
            }
        });
        this.expando = jQuery.expando + Data.uid++;
    }
    Data.uid = 1;
    Data.accepts = jQuery.acceptData;
    Data.prototype = {
        key: function (owner) {
            if (!Data.accepts(owner)) {
                return 0;
            }
            var descriptor = {}, unlock = owner[this.expando];
            if (!unlock) {
                unlock = Data.uid++;
                try {
                    descriptor[this.expando] = { value: unlock };
                    Object.defineProperties(owner, descriptor);
                } catch (e) {
                    descriptor[this.expando] = unlock;
                    jQuery.extend(owner, descriptor);
                }
            }
            if (!this.cache[unlock]) {
                this.cache[unlock] = {};
            }
            return unlock;
        },
        set: function (owner, data, value) {
            var prop, unlock = this.key(owner), cache = this.cache[unlock];
            if (typeof data === 'string') {
                cache[data] = value;
            } else {
                if (jQuery.isEmptyObject(cache)) {
                    jQuery.extend(this.cache[unlock], data);
                } else {
                    for (prop in data) {
                        cache[prop] = data[prop];
                    }
                }
            }
            return cache;
        },
        get: function (owner, key) {
            var cache = this.cache[this.key(owner)];
            return key === undefined ? cache : cache[key];
        },
        access: function (owner, key, value) {
            var stored;
            if (key === undefined || key && typeof key === 'string' && value === undefined) {
                stored = this.get(owner, key);
                return stored !== undefined ? stored : this.get(owner, jQuery.camelCase(key));
            }
            this.set(owner, key, value);
            return value !== undefined ? value : key;
        },
        remove: function (owner, key) {
            var i, name, camel, unlock = this.key(owner), cache = this.cache[unlock];
            if (key === undefined) {
                this.cache[unlock] = {};
            } else {
                if (jQuery.isArray(key)) {
                    name = key.concat(key.map(jQuery.camelCase));
                } else {
                    camel = jQuery.camelCase(key);
                    if (key in cache) {
                        name = [
                            key,
                            camel
                        ];
                    } else {
                        name = camel;
                        name = name in cache ? [name] : name.match(rnotwhite) || [];
                    }
                }
                i = name.length;
                while (i--) {
                    delete cache[name[i]];
                }
            }
        },
        hasData: function (owner) {
            return !jQuery.isEmptyObject(this.cache[owner[this.expando]] || {});
        },
        discard: function (owner) {
            if (owner[this.expando]) {
                delete this.cache[owner[this.expando]];
            }
        }
    };
    var data_priv = new Data();
    var data_user = new Data();
    var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /([A-Z])/g;
    function dataAttr(elem, key, data) {
        var name;
        if (data === undefined && elem.nodeType === 1) {
            name = 'data-' + key.replace(rmultiDash, '-$1').toLowerCase();
            data = elem.getAttribute(name);
            if (typeof data === 'string') {
                try {
                    data = data === 'true' ? true : data === 'false' ? false : data === 'null' ? null : +data + '' === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
                } catch (e) {
                }
                data_user.set(elem, key, data);
            } else {
                data = undefined;
            }
        }
        return data;
    }
    jQuery.extend({
        hasData: function (elem) {
            return data_user.hasData(elem) || data_priv.hasData(elem);
        },
        data: function (elem, name, data) {
            return data_user.access(elem, name, data);
        },
        removeData: function (elem, name) {
            data_user.remove(elem, name);
        },
        _data: function (elem, name, data) {
            return data_priv.access(elem, name, data);
        },
        _removeData: function (elem, name) {
            data_priv.remove(elem, name);
        }
    });
    jQuery.fn.extend({
        data: function (key, value) {
            var i, name, data, elem = this[0], attrs = elem && elem.attributes;
            if (key === undefined) {
                if (this.length) {
                    data = data_user.get(elem);
                    if (elem.nodeType === 1 && !data_priv.get(elem, 'hasDataAttrs')) {
                        i = attrs.length;
                        while (i--) {
                            if (attrs[i]) {
                                name = attrs[i].name;
                                if (name.indexOf('data-') === 0) {
                                    name = jQuery.camelCase(name.slice(5));
                                    dataAttr(elem, name, data[name]);
                                }
                            }
                        }
                        data_priv.set(elem, 'hasDataAttrs', true);
                    }
                }
                return data;
            }
            if (typeof key === 'object') {
                return this.each(function () {
                    data_user.set(this, key);
                });
            }
            return access(this, function (value) {
                var data, camelKey = jQuery.camelCase(key);
                if (elem && value === undefined) {
                    data = data_user.get(elem, key);
                    if (data !== undefined) {
                        return data;
                    }
                    data = data_user.get(elem, camelKey);
                    if (data !== undefined) {
                        return data;
                    }
                    data = dataAttr(elem, camelKey, undefined);
                    if (data !== undefined) {
                        return data;
                    }
                    return;
                }
                this.each(function () {
                    var data = data_user.get(this, camelKey);
                    data_user.set(this, camelKey, value);
                    if (key.indexOf('-') !== -1 && data !== undefined) {
                        data_user.set(this, key, value);
                    }
                });
            }, null, value, arguments.length > 1, null, true);
        },
        removeData: function (key) {
            return this.each(function () {
                data_user.remove(this, key);
            });
        }
    });
    jQuery.extend({
        queue: function (elem, type, data) {
            var queue;
            if (elem) {
                type = (type || 'fx') + 'queue';
                queue = data_priv.get(elem, type);
                if (data) {
                    if (!queue || jQuery.isArray(data)) {
                        queue = data_priv.access(elem, type, jQuery.makeArray(data));
                    } else {
                        queue.push(data);
                    }
                }
                return queue || [];
            }
        },
        dequeue: function (elem, type) {
            type = type || 'fx';
            var queue = jQuery.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery._queueHooks(elem, type), next = function () {
                    jQuery.dequeue(elem, type);
                };
            if (fn === 'inprogress') {
                fn = queue.shift();
                startLength--;
            }
            if (fn) {
                if (type === 'fx') {
                    queue.unshift('inprogress');
                }
                delete hooks.stop;
                fn.call(elem, next, hooks);
            }
            if (!startLength && hooks) {
                hooks.empty.fire();
            }
        },
        _queueHooks: function (elem, type) {
            var key = type + 'queueHooks';
            return data_priv.get(elem, key) || data_priv.access(elem, key, {
                empty: jQuery.Callbacks('once memory').add(function () {
                    data_priv.remove(elem, [
                        type + 'queue',
                        key
                    ]);
                })
            });
        }
    });
    jQuery.fn.extend({
        queue: function (type, data) {
            var setter = 2;
            if (typeof type !== 'string') {
                data = type;
                type = 'fx';
                setter--;
            }
            if (arguments.length < setter) {
                return jQuery.queue(this[0], type);
            }
            return data === undefined ? this : this.each(function () {
                var queue = jQuery.queue(this, type, data);
                jQuery._queueHooks(this, type);
                if (type === 'fx' && queue[0] !== 'inprogress') {
                    jQuery.dequeue(this, type);
                }
            });
        },
        dequeue: function (type) {
            return this.each(function () {
                jQuery.dequeue(this, type);
            });
        },
        clearQueue: function (type) {
            return this.queue(type || 'fx', []);
        },
        promise: function (type, obj) {
            var tmp, count = 1, defer = jQuery.Deferred(), elements = this, i = this.length, resolve = function () {
                    if (!--count) {
                        defer.resolveWith(elements, [elements]);
                    }
                };
            if (typeof type !== 'string') {
                obj = type;
                type = undefined;
            }
            type = type || 'fx';
            while (i--) {
                tmp = data_priv.get(elements[i], type + 'queueHooks');
                if (tmp && tmp.empty) {
                    count++;
                    tmp.empty.add(resolve);
                }
            }
            resolve();
            return defer.promise(obj);
        }
    });
    var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
    var cssExpand = [
        'Top',
        'Right',
        'Bottom',
        'Left'
    ];
    var isHidden = function (elem, el) {
        elem = el || elem;
        return jQuery.css(elem, 'display') === 'none' || !jQuery.contains(elem.ownerDocument, elem);
    };
    var rcheckableType = /^(?:checkbox|radio)$/i;
    (function () {
        var fragment = document.createDocumentFragment(), div = fragment.appendChild(document.createElement('div')), input = document.createElement('input');
        input.setAttribute('type', 'radio');
        input.setAttribute('checked', 'checked');
        input.setAttribute('name', 't');
        div.appendChild(input);
        support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
        div.innerHTML = '<textarea>x</textarea>';
        support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
    }());
    var strundefined = typeof undefined;
    support.focusinBubbles = 'onfocusin' in window;
    var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/, rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
    function returnTrue() {
        return true;
    }
    function returnFalse() {
        return false;
    }
    function safeActiveElement() {
        try {
            return document.activeElement;
        } catch (err) {
        }
    }
    jQuery.event = {
        global: {},
        add: function (elem, types, handler, data, selector) {
            var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = data_priv.get(elem);
            if (!elemData) {
                return;
            }
            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }
            if (!handler.guid) {
                handler.guid = jQuery.guid++;
            }
            if (!(events = elemData.events)) {
                events = elemData.events = {};
            }
            if (!(eventHandle = elemData.handle)) {
                eventHandle = elemData.handle = function (e) {
                    return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ? jQuery.event.dispatch.apply(elem, arguments) : undefined;
                };
            }
            types = (types || '').match(rnotwhite) || [''];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || '').split('.').sort();
                if (!type) {
                    continue;
                }
                special = jQuery.event.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                special = jQuery.event.special[type] || {};
                handleObj = jQuery.extend({
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                    namespace: namespaces.join('.')
                }, handleObjIn);
                if (!(handlers = events[type])) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                        if (elem.addEventListener) {
                            elem.addEventListener(type, eventHandle, false);
                        }
                    }
                }
                if (special.add) {
                    special.add.call(elem, handleObj);
                    if (!handleObj.handler.guid) {
                        handleObj.handler.guid = handler.guid;
                    }
                }
                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else {
                    handlers.push(handleObj);
                }
                jQuery.event.global[type] = true;
            }
        },
        remove: function (elem, types, handler, selector, mappedTypes) {
            var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = data_priv.hasData(elem) && data_priv.get(elem);
            if (!elemData || !(events = elemData.events)) {
                return;
            }
            types = (types || '').match(rnotwhite) || [''];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || '').split('.').sort();
                if (!type) {
                    for (type in events) {
                        jQuery.event.remove(elem, type + types[t], handler, selector, true);
                    }
                    continue;
                }
                special = jQuery.event.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                handlers = events[type] || [];
                tmp = tmp[2] && new RegExp('(^|\\.)' + namespaces.join('\\.(?:.*\\.|)') + '(\\.|$)');
                origCount = j = handlers.length;
                while (j--) {
                    handleObj = handlers[j];
                    if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === '**' && handleObj.selector)) {
                        handlers.splice(j, 1);
                        if (handleObj.selector) {
                            handlers.delegateCount--;
                        }
                        if (special.remove) {
                            special.remove.call(elem, handleObj);
                        }
                    }
                }
                if (origCount && !handlers.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                        jQuery.removeEvent(elem, type, elemData.handle);
                    }
                    delete events[type];
                }
            }
            if (jQuery.isEmptyObject(events)) {
                delete elemData.handle;
                data_priv.remove(elem, 'events');
            }
        },
        trigger: function (event, data, elem, onlyHandlers) {
            var i, cur, tmp, bubbleType, ontype, handle, special, eventPath = [elem || document], type = hasOwn.call(event, 'type') ? event.type : event, namespaces = hasOwn.call(event, 'namespace') ? event.namespace.split('.') : [];
            cur = tmp = elem = elem || document;
            if (elem.nodeType === 3 || elem.nodeType === 8) {
                return;
            }
            if (rfocusMorph.test(type + jQuery.event.triggered)) {
                return;
            }
            if (type.indexOf('.') >= 0) {
                namespaces = type.split('.');
                type = namespaces.shift();
                namespaces.sort();
            }
            ontype = type.indexOf(':') < 0 && 'on' + type;
            event = event[jQuery.expando] ? event : new jQuery.Event(type, typeof event === 'object' && event);
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join('.');
            event.namespace_re = event.namespace ? new RegExp('(^|\\.)' + namespaces.join('\\.(?:.*\\.|)') + '(\\.|$)') : null;
            event.result = undefined;
            if (!event.target) {
                event.target = elem;
            }
            data = data == null ? [event] : jQuery.makeArray(data, [event]);
            special = jQuery.event.special[type] || {};
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
                return;
            }
            if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
                bubbleType = special.delegateType || type;
                if (!rfocusMorph.test(bubbleType + type)) {
                    cur = cur.parentNode;
                }
                for (; cur; cur = cur.parentNode) {
                    eventPath.push(cur);
                    tmp = cur;
                }
                if (tmp === (elem.ownerDocument || document)) {
                    eventPath.push(tmp.defaultView || tmp.parentWindow || window);
                }
            }
            i = 0;
            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
                event.type = i > 1 ? bubbleType : special.bindType || type;
                handle = (data_priv.get(cur, 'events') || {})[event.type] && data_priv.get(cur, 'handle');
                if (handle) {
                    handle.apply(cur, data);
                }
                handle = ontype && cur[ontype];
                if (handle && handle.apply && jQuery.acceptData(cur)) {
                    event.result = handle.apply(cur, data);
                    if (event.result === false) {
                        event.preventDefault();
                    }
                }
            }
            event.type = type;
            if (!onlyHandlers && !event.isDefaultPrevented()) {
                if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && jQuery.acceptData(elem)) {
                    if (ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem)) {
                        tmp = elem[ontype];
                        if (tmp) {
                            elem[ontype] = null;
                        }
                        jQuery.event.triggered = type;
                        elem[type]();
                        jQuery.event.triggered = undefined;
                        if (tmp) {
                            elem[ontype] = tmp;
                        }
                    }
                }
            }
            return event.result;
        },
        dispatch: function (event) {
            event = jQuery.event.fix(event);
            var i, j, ret, matched, handleObj, handlerQueue = [], args = slice.call(arguments), handlers = (data_priv.get(this, 'events') || {})[event.type] || [], special = jQuery.event.special[event.type] || {};
            args[0] = event;
            event.delegateTarget = this;
            if (special.preDispatch && special.preDispatch.call(this, event) === false) {
                return;
            }
            handlerQueue = jQuery.event.handlers.call(this, event, handlers);
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
                event.currentTarget = matched.elem;
                j = 0;
                while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
                    if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {
                        event.handleObj = handleObj;
                        event.data = handleObj.data;
                        ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                        if (ret !== undefined) {
                            if ((event.result = ret) === false) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }
            if (special.postDispatch) {
                special.postDispatch.call(this, event);
            }
            return event.result;
        },
        handlers: function (event, handlers) {
            var i, matches, sel, handleObj, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
            if (delegateCount && cur.nodeType && (!event.button || event.type !== 'click')) {
                for (; cur !== this; cur = cur.parentNode || this) {
                    if (cur.disabled !== true || event.type !== 'click') {
                        matches = [];
                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[i];
                            sel = handleObj.selector + ' ';
                            if (matches[sel] === undefined) {
                                matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [cur]).length;
                            }
                            if (matches[sel]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({
                                elem: cur,
                                handlers: matches
                            });
                        }
                    }
                }
            }
            if (delegateCount < handlers.length) {
                handlerQueue.push({
                    elem: this,
                    handlers: handlers.slice(delegateCount)
                });
            }
            return handlerQueue;
        },
        props: 'altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which'.split(' '),
        fixHooks: {},
        keyHooks: {
            props: 'char charCode key keyCode'.split(' '),
            filter: function (event, original) {
                if (event.which == null) {
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }
                return event;
            }
        },
        mouseHooks: {
            props: 'button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement'.split(' '),
            filter: function (event, original) {
                var eventDoc, doc, body, button = original.button;
                if (event.pageX == null && original.clientX != null) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;
                    event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
                }
                if (!event.which && button !== undefined) {
                    event.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
                }
                return event;
            }
        },
        fix: function (event) {
            if (event[jQuery.expando]) {
                return event;
            }
            var i, prop, copy, type = event.type, originalEvent = event, fixHook = this.fixHooks[type];
            if (!fixHook) {
                this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
            }
            copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
            event = new jQuery.Event(originalEvent);
            i = copy.length;
            while (i--) {
                prop = copy[i];
                event[prop] = originalEvent[prop];
            }
            if (!event.target) {
                event.target = document;
            }
            if (event.target.nodeType === 3) {
                event.target = event.target.parentNode;
            }
            return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
        },
        special: {
            load: { noBubble: true },
            focus: {
                trigger: function () {
                    if (this !== safeActiveElement() && this.focus) {
                        this.focus();
                        return false;
                    }
                },
                delegateType: 'focusin'
            },
            blur: {
                trigger: function () {
                    if (this === safeActiveElement() && this.blur) {
                        this.blur();
                        return false;
                    }
                },
                delegateType: 'focusout'
            },
            click: {
                trigger: function () {
                    if (this.type === 'checkbox' && this.click && jQuery.nodeName(this, 'input')) {
                        this.click();
                        return false;
                    }
                },
                _default: function (event) {
                    return jQuery.nodeName(event.target, 'a');
                }
            },
            beforeunload: {
                postDispatch: function (event) {
                    if (event.result !== undefined && event.originalEvent) {
                        event.originalEvent.returnValue = event.result;
                    }
                }
            }
        },
        simulate: function (type, elem, event, bubble) {
            var e = jQuery.extend(new jQuery.Event(), event, {
                type: type,
                isSimulated: true,
                originalEvent: {}
            });
            if (bubble) {
                jQuery.event.trigger(e, null, elem);
            } else {
                jQuery.event.dispatch.call(elem, e);
            }
            if (e.isDefaultPrevented()) {
                event.preventDefault();
            }
        }
    };
    jQuery.removeEvent = function (elem, type, handle) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, handle, false);
        }
    };
    jQuery.Event = function (src, props) {
        if (!(this instanceof jQuery.Event)) {
            return new jQuery.Event(src, props);
        }
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined && src.returnValue === false ? returnTrue : returnFalse;
        } else {
            this.type = src;
        }
        if (props) {
            jQuery.extend(this, props);
        }
        this.timeStamp = src && src.timeStamp || jQuery.now();
        this[jQuery.expando] = true;
    };
    jQuery.Event.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        preventDefault: function () {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (e && e.preventDefault) {
                e.preventDefault();
            }
        },
        stopPropagation: function () {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function () {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = returnTrue;
            if (e && e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            }
            this.stopPropagation();
        }
    };
    jQuery.each({
        mouseenter: 'mouseover',
        mouseleave: 'mouseout',
        pointerenter: 'pointerover',
        pointerleave: 'pointerout'
    }, function (orig, fix) {
        jQuery.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function (event) {
                var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
                if (!related || related !== target && !jQuery.contains(target, related)) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    event.type = fix;
                }
                return ret;
            }
        };
    });
    if (!support.focusinBubbles) {
        jQuery.each({
            focus: 'focusin',
            blur: 'focusout'
        }, function (orig, fix) {
            var handler = function (event) {
                jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
            };
            jQuery.event.special[fix] = {
                setup: function () {
                    var doc = this.ownerDocument || this, attaches = data_priv.access(doc, fix);
                    if (!attaches) {
                        doc.addEventListener(orig, handler, true);
                    }
                    data_priv.access(doc, fix, (attaches || 0) + 1);
                },
                teardown: function () {
                    var doc = this.ownerDocument || this, attaches = data_priv.access(doc, fix) - 1;
                    if (!attaches) {
                        doc.removeEventListener(orig, handler, true);
                        data_priv.remove(doc, fix);
                    } else {
                        data_priv.access(doc, fix, attaches);
                    }
                }
            };
        });
    }
    jQuery.fn.extend({
        on: function (types, selector, data, fn, one) {
            var origFn, type;
            if (typeof types === 'object') {
                if (typeof selector !== 'string') {
                    data = data || selector;
                    selector = undefined;
                }
                for (type in types) {
                    this.on(type, selector, data, types[type], one);
                }
                return this;
            }
            if (data == null && fn == null) {
                fn = selector;
                data = selector = undefined;
            } else if (fn == null) {
                if (typeof selector === 'string') {
                    fn = data;
                    data = undefined;
                } else {
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }
            if (fn === false) {
                fn = returnFalse;
            } else if (!fn) {
                return this;
            }
            if (one === 1) {
                origFn = fn;
                fn = function (event) {
                    jQuery().off(event);
                    return origFn.apply(this, arguments);
                };
                fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
            }
            return this.each(function () {
                jQuery.event.add(this, types, fn, data, selector);
            });
        },
        one: function (types, selector, data, fn) {
            return this.on(types, selector, data, fn, 1);
        },
        off: function (types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
                handleObj = types.handleObj;
                jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + '.' + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
                return this;
            }
            if (typeof types === 'object') {
                for (type in types) {
                    this.off(type, selector, types[type]);
                }
                return this;
            }
            if (selector === false || typeof selector === 'function') {
                fn = selector;
                selector = undefined;
            }
            if (fn === false) {
                fn = returnFalse;
            }
            return this.each(function () {
                jQuery.event.remove(this, types, fn, selector);
            });
        },
        trigger: function (type, data) {
            return this.each(function () {
                jQuery.event.trigger(type, data, this);
            });
        },
        triggerHandler: function (type, data) {
            var elem = this[0];
            if (elem) {
                return jQuery.event.trigger(type, data, elem, true);
            }
        }
    });
    var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, rtagName = /<([\w:]+)/, rhtml = /<|&#?\w+;/, rnoInnerhtml = /<(?:script|style|link)/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rscriptType = /^$|\/(?:java|ecma)script/i, rscriptTypeMasked = /^true\/(.*)/, rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, wrapMap = {
            option: [
                1,
                '<select multiple=\'multiple\'>',
                '</select>'
            ],
            thead: [
                1,
                '<table>',
                '</table>'
            ],
            col: [
                2,
                '<table><colgroup>',
                '</colgroup></table>'
            ],
            tr: [
                2,
                '<table><tbody>',
                '</tbody></table>'
            ],
            td: [
                3,
                '<table><tbody><tr>',
                '</tr></tbody></table>'
            ],
            _default: [
                0,
                '',
                ''
            ]
        };
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    function manipulationTarget(elem, content) {
        return jQuery.nodeName(elem, 'table') && jQuery.nodeName(content.nodeType !== 11 ? content : content.firstChild, 'tr') ? elem.getElementsByTagName('tbody')[0] || elem.appendChild(elem.ownerDocument.createElement('tbody')) : elem;
    }
    function disableScript(elem) {
        elem.type = (elem.getAttribute('type') !== null) + '/' + elem.type;
        return elem;
    }
    function restoreScript(elem) {
        var match = rscriptTypeMasked.exec(elem.type);
        if (match) {
            elem.type = match[1];
        } else {
            elem.removeAttribute('type');
        }
        return elem;
    }
    function setGlobalEval(elems, refElements) {
        var i = 0, l = elems.length;
        for (; i < l; i++) {
            data_priv.set(elems[i], 'globalEval', !refElements || data_priv.get(refElements[i], 'globalEval'));
        }
    }
    function cloneCopyEvent(src, dest) {
        var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;
        if (dest.nodeType !== 1) {
            return;
        }
        if (data_priv.hasData(src)) {
            pdataOld = data_priv.access(src);
            pdataCur = data_priv.set(dest, pdataOld);
            events = pdataOld.events;
            if (events) {
                delete pdataCur.handle;
                pdataCur.events = {};
                for (type in events) {
                    for (i = 0, l = events[type].length; i < l; i++) {
                        jQuery.event.add(dest, type, events[type][i]);
                    }
                }
            }
        }
        if (data_user.hasData(src)) {
            udataOld = data_user.access(src);
            udataCur = jQuery.extend({}, udataOld);
            data_user.set(dest, udataCur);
        }
    }
    function getAll(context, tag) {
        var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || '*') : context.querySelectorAll ? context.querySelectorAll(tag || '*') : [];
        return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], ret) : ret;
    }
    function fixInput(src, dest) {
        var nodeName = dest.nodeName.toLowerCase();
        if (nodeName === 'input' && rcheckableType.test(src.type)) {
            dest.checked = src.checked;
        } else if (nodeName === 'input' || nodeName === 'textarea') {
            dest.defaultValue = src.defaultValue;
        }
    }
    jQuery.extend({
        clone: function (elem, dataAndEvents, deepDataAndEvents) {
            var i, l, srcElements, destElements, clone = elem.cloneNode(true), inPage = jQuery.contains(elem.ownerDocument, elem);
            if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
                destElements = getAll(clone);
                srcElements = getAll(elem);
                for (i = 0, l = srcElements.length; i < l; i++) {
                    fixInput(srcElements[i], destElements[i]);
                }
            }
            if (dataAndEvents) {
                if (deepDataAndEvents) {
                    srcElements = srcElements || getAll(elem);
                    destElements = destElements || getAll(clone);
                    for (i = 0, l = srcElements.length; i < l; i++) {
                        cloneCopyEvent(srcElements[i], destElements[i]);
                    }
                } else {
                    cloneCopyEvent(elem, clone);
                }
            }
            destElements = getAll(clone, 'script');
            if (destElements.length > 0) {
                setGlobalEval(destElements, !inPage && getAll(elem, 'script'));
            }
            return clone;
        },
        buildFragment: function (elems, context, scripts, selection) {
            var elem, tmp, tag, wrap, contains, j, fragment = context.createDocumentFragment(), nodes = [], i = 0, l = elems.length;
            for (; i < l; i++) {
                elem = elems[i];
                if (elem || elem === 0) {
                    if (jQuery.type(elem) === 'object') {
                        jQuery.merge(nodes, elem.nodeType ? [elem] : elem);
                    } else if (!rhtml.test(elem)) {
                        nodes.push(context.createTextNode(elem));
                    } else {
                        tmp = tmp || fragment.appendChild(context.createElement('div'));
                        tag = (rtagName.exec(elem) || [
                            '',
                            ''
                        ])[1].toLowerCase();
                        wrap = wrapMap[tag] || wrapMap._default;
                        tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, '<$1></$2>') + wrap[2];
                        j = wrap[0];
                        while (j--) {
                            tmp = tmp.lastChild;
                        }
                        jQuery.merge(nodes, tmp.childNodes);
                        tmp = fragment.firstChild;
                        tmp.textContent = '';
                    }
                }
            }
            fragment.textContent = '';
            i = 0;
            while (elem = nodes[i++]) {
                if (selection && jQuery.inArray(elem, selection) !== -1) {
                    continue;
                }
                contains = jQuery.contains(elem.ownerDocument, elem);
                tmp = getAll(fragment.appendChild(elem), 'script');
                if (contains) {
                    setGlobalEval(tmp);
                }
                if (scripts) {
                    j = 0;
                    while (elem = tmp[j++]) {
                        if (rscriptType.test(elem.type || '')) {
                            scripts.push(elem);
                        }
                    }
                }
            }
            return fragment;
        },
        cleanData: function (elems) {
            var data, elem, type, key, special = jQuery.event.special, i = 0;
            for (; (elem = elems[i]) !== undefined; i++) {
                if (jQuery.acceptData(elem)) {
                    key = elem[data_priv.expando];
                    if (key && (data = data_priv.cache[key])) {
                        if (data.events) {
                            for (type in data.events) {
                                if (special[type]) {
                                    jQuery.event.remove(elem, type);
                                } else {
                                    jQuery.removeEvent(elem, type, data.handle);
                                }
                            }
                        }
                        if (data_priv.cache[key]) {
                            delete data_priv.cache[key];
                        }
                    }
                }
                delete data_user.cache[elem[data_user.expando]];
            }
        }
    });
    jQuery.fn.extend({
        text: function (value) {
            return access(this, function (value) {
                return value === undefined ? jQuery.text(this) : this.empty().each(function () {
                    if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                        this.textContent = value;
                    }
                });
            }, null, value, arguments.length);
        },
        append: function () {
            return this.domManip(arguments, function (elem) {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                    var target = manipulationTarget(this, elem);
                    target.appendChild(elem);
                }
            });
        },
        prepend: function () {
            return this.domManip(arguments, function (elem) {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                    var target = manipulationTarget(this, elem);
                    target.insertBefore(elem, target.firstChild);
                }
            });
        },
        before: function () {
            return this.domManip(arguments, function (elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this);
                }
            });
        },
        after: function () {
            return this.domManip(arguments, function (elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this.nextSibling);
                }
            });
        },
        remove: function (selector, keepData) {
            var elem, elems = selector ? jQuery.filter(selector, this) : this, i = 0;
            for (; (elem = elems[i]) != null; i++) {
                if (!keepData && elem.nodeType === 1) {
                    jQuery.cleanData(getAll(elem));
                }
                if (elem.parentNode) {
                    if (keepData && jQuery.contains(elem.ownerDocument, elem)) {
                        setGlobalEval(getAll(elem, 'script'));
                    }
                    elem.parentNode.removeChild(elem);
                }
            }
            return this;
        },
        empty: function () {
            var elem, i = 0;
            for (; (elem = this[i]) != null; i++) {
                if (elem.nodeType === 1) {
                    jQuery.cleanData(getAll(elem, false));
                    elem.textContent = '';
                }
            }
            return this;
        },
        clone: function (dataAndEvents, deepDataAndEvents) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
            return this.map(function () {
                return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
            });
        },
        html: function (value) {
            return access(this, function (value) {
                var elem = this[0] || {}, i = 0, l = this.length;
                if (value === undefined && elem.nodeType === 1) {
                    return elem.innerHTML;
                }
                if (typeof value === 'string' && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || [
                        '',
                        ''
                    ])[1].toLowerCase()]) {
                    value = value.replace(rxhtmlTag, '<$1></$2>');
                    try {
                        for (; i < l; i++) {
                            elem = this[i] || {};
                            if (elem.nodeType === 1) {
                                jQuery.cleanData(getAll(elem, false));
                                elem.innerHTML = value;
                            }
                        }
                        elem = 0;
                    } catch (e) {
                    }
                }
                if (elem) {
                    this.empty().append(value);
                }
            }, null, value, arguments.length);
        },
        replaceWith: function () {
            var arg = arguments[0];
            this.domManip(arguments, function (elem) {
                arg = this.parentNode;
                jQuery.cleanData(getAll(this));
                if (arg) {
                    arg.replaceChild(elem, this);
                }
            });
            return arg && (arg.length || arg.nodeType) ? this : this.remove();
        },
        detach: function (selector) {
            return this.remove(selector, true);
        },
        domManip: function (args, callback) {
            args = concat.apply([], args);
            var fragment, first, scripts, hasScripts, node, doc, i = 0, l = this.length, set = this, iNoClone = l - 1, value = args[0], isFunction = jQuery.isFunction(value);
            if (isFunction || l > 1 && typeof value === 'string' && !support.checkClone && rchecked.test(value)) {
                return this.each(function (index) {
                    var self = set.eq(index);
                    if (isFunction) {
                        args[0] = value.call(this, index, self.html());
                    }
                    self.domManip(args, callback);
                });
            }
            if (l) {
                fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this);
                first = fragment.firstChild;
                if (fragment.childNodes.length === 1) {
                    fragment = first;
                }
                if (first) {
                    scripts = jQuery.map(getAll(fragment, 'script'), disableScript);
                    hasScripts = scripts.length;
                    for (; i < l; i++) {
                        node = fragment;
                        if (i !== iNoClone) {
                            node = jQuery.clone(node, true, true);
                            if (hasScripts) {
                                jQuery.merge(scripts, getAll(node, 'script'));
                            }
                        }
                        callback.call(this[i], node, i);
                    }
                    if (hasScripts) {
                        doc = scripts[scripts.length - 1].ownerDocument;
                        jQuery.map(scripts, restoreScript);
                        for (i = 0; i < hasScripts; i++) {
                            node = scripts[i];
                            if (rscriptType.test(node.type || '') && !data_priv.access(node, 'globalEval') && jQuery.contains(doc, node)) {
                                if (node.src) {
                                    if (jQuery._evalUrl) {
                                        jQuery._evalUrl(node.src);
                                    }
                                } else {
                                    jQuery.globalEval(node.textContent.replace(rcleanScript, ''));
                                }
                            }
                        }
                    }
                }
            }
            return this;
        }
    });
    jQuery.each({
        appendTo: 'append',
        prependTo: 'prepend',
        insertBefore: 'before',
        insertAfter: 'after',
        replaceAll: 'replaceWith'
    }, function (name, original) {
        jQuery.fn[name] = function (selector) {
            var elems, ret = [], insert = jQuery(selector), last = insert.length - 1, i = 0;
            for (; i <= last; i++) {
                elems = i === last ? this : this.clone(true);
                jQuery(insert[i])[original](elems);
                push.apply(ret, elems.get());
            }
            return this.pushStack(ret);
        };
    });
    var iframe, elemdisplay = {};
    function actualDisplay(name, doc) {
        var style, elem = jQuery(doc.createElement(name)).appendTo(doc.body), display = window.getDefaultComputedStyle && (style = window.getDefaultComputedStyle(elem[0])) ? style.display : jQuery.css(elem[0], 'display');
        elem.detach();
        return display;
    }
    function defaultDisplay(nodeName) {
        var doc = document, display = elemdisplay[nodeName];
        if (!display) {
            display = actualDisplay(nodeName, doc);
            if (display === 'none' || !display) {
                iframe = (iframe || jQuery('<iframe frameborder=\'0\' width=\'0\' height=\'0\'/>')).appendTo(doc.documentElement);
                doc = iframe[0].contentDocument;
                doc.write();
                doc.close();
                display = actualDisplay(nodeName, doc);
                iframe.detach();
            }
            elemdisplay[nodeName] = display;
        }
        return display;
    }
    var rmargin = /^margin/;
    var rnumnonpx = new RegExp('^(' + pnum + ')(?!px)[a-z%]+$', 'i');
    var getStyles = function (elem) {
        if (elem.ownerDocument.defaultView.opener) {
            return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
        }
        return window.getComputedStyle(elem, null);
    };
    function curCSS(elem, name, computed) {
        var width, minWidth, maxWidth, ret, style = elem.style;
        computed = computed || getStyles(elem);
        if (computed) {
            ret = computed.getPropertyValue(name) || computed[name];
        }
        if (computed) {
            if (ret === '' && !jQuery.contains(elem.ownerDocument, elem)) {
                ret = jQuery.style(elem, name);
            }
            if (rnumnonpx.test(ret) && rmargin.test(name)) {
                width = style.width;
                minWidth = style.minWidth;
                maxWidth = style.maxWidth;
                style.minWidth = style.maxWidth = style.width = ret;
                ret = computed.width;
                style.width = width;
                style.minWidth = minWidth;
                style.maxWidth = maxWidth;
            }
        }
        return ret !== undefined ? ret + '' : ret;
    }
    function addGetHookIf(conditionFn, hookFn) {
        return {
            get: function () {
                if (conditionFn()) {
                    delete this.get;
                    return;
                }
                return (this.get = hookFn).apply(this, arguments);
            }
        };
    }
    (function () {
        var pixelPositionVal, boxSizingReliableVal, docElem = document.documentElement, container = document.createElement('div'), div = document.createElement('div');
        if (!div.style) {
            return;
        }
        div.style.backgroundClip = 'content-box';
        div.cloneNode(true).style.backgroundClip = '';
        support.clearCloneStyle = div.style.backgroundClip === 'content-box';
        container.style.cssText = 'border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;' + 'position:absolute';
        container.appendChild(div);
        function computePixelPositionAndBoxSizingReliable() {
            div.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;' + 'box-sizing:border-box;display:block;margin-top:1%;top:1%;' + 'border:1px;padding:1px;width:4px;position:absolute';
            div.innerHTML = '';
            docElem.appendChild(container);
            var divStyle = window.getComputedStyle(div, null);
            pixelPositionVal = divStyle.top !== '1%';
            boxSizingReliableVal = divStyle.width === '4px';
            docElem.removeChild(container);
        }
        if (window.getComputedStyle) {
            jQuery.extend(support, {
                pixelPosition: function () {
                    computePixelPositionAndBoxSizingReliable();
                    return pixelPositionVal;
                },
                boxSizingReliable: function () {
                    if (boxSizingReliableVal == null) {
                        computePixelPositionAndBoxSizingReliable();
                    }
                    return boxSizingReliableVal;
                },
                reliableMarginRight: function () {
                    var ret, marginDiv = div.appendChild(document.createElement('div'));
                    marginDiv.style.cssText = div.style.cssText = '-webkit-box-sizing:content-box;-moz-box-sizing:content-box;' + 'box-sizing:content-box;display:block;margin:0;border:0;padding:0';
                    marginDiv.style.marginRight = marginDiv.style.width = '0';
                    div.style.width = '1px';
                    docElem.appendChild(container);
                    ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);
                    docElem.removeChild(container);
                    div.removeChild(marginDiv);
                    return ret;
                }
            });
        }
    }());
    jQuery.swap = function (elem, options, callback, args) {
        var ret, name, old = {};
        for (name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
        }
        ret = callback.apply(elem, args || []);
        for (name in options) {
            elem.style[name] = old[name];
        }
        return ret;
    };
    var rdisplayswap = /^(none|table(?!-c[ea]).+)/, rnumsplit = new RegExp('^(' + pnum + ')(.*)$', 'i'), rrelNum = new RegExp('^([+-])=(' + pnum + ')', 'i'), cssShow = {
            position: 'absolute',
            visibility: 'hidden',
            display: 'block'
        }, cssNormalTransform = {
            letterSpacing: '0',
            fontWeight: '400'
        }, cssPrefixes = [
            'Webkit',
            'O',
            'Moz',
            'ms'
        ];
    function vendorPropName(style, name) {
        if (name in style) {
            return name;
        }
        var capName = name[0].toUpperCase() + name.slice(1), origName = name, i = cssPrefixes.length;
        while (i--) {
            name = cssPrefixes[i] + capName;
            if (name in style) {
                return name;
            }
        }
        return origName;
    }
    function setPositiveNumber(elem, value, subtract) {
        var matches = rnumsplit.exec(value);
        return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || 'px') : value;
    }
    function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
        var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : name === 'width' ? 1 : 0, val = 0;
        for (; i < 4; i += 2) {
            if (extra === 'margin') {
                val += jQuery.css(elem, extra + cssExpand[i], true, styles);
            }
            if (isBorderBox) {
                if (extra === 'content') {
                    val -= jQuery.css(elem, 'padding' + cssExpand[i], true, styles);
                }
                if (extra !== 'margin') {
                    val -= jQuery.css(elem, 'border' + cssExpand[i] + 'Width', true, styles);
                }
            } else {
                val += jQuery.css(elem, 'padding' + cssExpand[i], true, styles);
                if (extra !== 'padding') {
                    val += jQuery.css(elem, 'border' + cssExpand[i] + 'Width', true, styles);
                }
            }
        }
        return val;
    }
    function getWidthOrHeight(elem, name, extra) {
        var valueIsBorderBox = true, val = name === 'width' ? elem.offsetWidth : elem.offsetHeight, styles = getStyles(elem), isBorderBox = jQuery.css(elem, 'boxSizing', false, styles) === 'border-box';
        if (val <= 0 || val == null) {
            val = curCSS(elem, name, styles);
            if (val < 0 || val == null) {
                val = elem.style[name];
            }
            if (rnumnonpx.test(val)) {
                return val;
            }
            valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
            val = parseFloat(val) || 0;
        }
        return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? 'border' : 'content'), valueIsBorderBox, styles) + 'px';
    }
    function showHide(elements, show) {
        var display, elem, hidden, values = [], index = 0, length = elements.length;
        for (; index < length; index++) {
            elem = elements[index];
            if (!elem.style) {
                continue;
            }
            values[index] = data_priv.get(elem, 'olddisplay');
            display = elem.style.display;
            if (show) {
                if (!values[index] && display === 'none') {
                    elem.style.display = '';
                }
                if (elem.style.display === '' && isHidden(elem)) {
                    values[index] = data_priv.access(elem, 'olddisplay', defaultDisplay(elem.nodeName));
                }
            } else {
                hidden = isHidden(elem);
                if (display !== 'none' || !hidden) {
                    data_priv.set(elem, 'olddisplay', hidden ? display : jQuery.css(elem, 'display'));
                }
            }
        }
        for (index = 0; index < length; index++) {
            elem = elements[index];
            if (!elem.style) {
                continue;
            }
            if (!show || elem.style.display === 'none' || elem.style.display === '') {
                elem.style.display = show ? values[index] || '' : 'none';
            }
        }
        return elements;
    }
    jQuery.extend({
        cssHooks: {
            opacity: {
                get: function (elem, computed) {
                    if (computed) {
                        var ret = curCSS(elem, 'opacity');
                        return ret === '' ? '1' : ret;
                    }
                }
            }
        },
        cssNumber: {
            'columnCount': true,
            'fillOpacity': true,
            'flexGrow': true,
            'flexShrink': true,
            'fontWeight': true,
            'lineHeight': true,
            'opacity': true,
            'order': true,
            'orphans': true,
            'widows': true,
            'zIndex': true,
            'zoom': true
        },
        cssProps: { 'float': 'cssFloat' },
        style: function (elem, name, value, extra) {
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
                return;
            }
            var ret, type, hooks, origName = jQuery.camelCase(name), style = elem.style;
            name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));
            hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
            if (value !== undefined) {
                type = typeof value;
                if (type === 'string' && (ret = rrelNum.exec(value))) {
                    value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
                    type = 'number';
                }
                if (value == null || value !== value) {
                    return;
                }
                if (type === 'number' && !jQuery.cssNumber[origName]) {
                    value += 'px';
                }
                if (!support.clearCloneStyle && value === '' && name.indexOf('background') === 0) {
                    style[name] = 'inherit';
                }
                if (!hooks || !('set' in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                    style[name] = value;
                }
            } else {
                if (hooks && 'get' in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                    return ret;
                }
                return style[name];
            }
        },
        css: function (elem, name, extra, styles) {
            var val, num, hooks, origName = jQuery.camelCase(name);
            name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));
            hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
            if (hooks && 'get' in hooks) {
                val = hooks.get(elem, true, extra);
            }
            if (val === undefined) {
                val = curCSS(elem, name, styles);
            }
            if (val === 'normal' && name in cssNormalTransform) {
                val = cssNormalTransform[name];
            }
            if (extra === '' || extra) {
                num = parseFloat(val);
                return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
            }
            return val;
        }
    });
    jQuery.each([
        'height',
        'width'
    ], function (i, name) {
        jQuery.cssHooks[name] = {
            get: function (elem, computed, extra) {
                if (computed) {
                    return rdisplayswap.test(jQuery.css(elem, 'display')) && elem.offsetWidth === 0 ? jQuery.swap(elem, cssShow, function () {
                        return getWidthOrHeight(elem, name, extra);
                    }) : getWidthOrHeight(elem, name, extra);
                }
            },
            set: function (elem, value, extra) {
                var styles = extra && getStyles(elem);
                return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, jQuery.css(elem, 'boxSizing', false, styles) === 'border-box', styles) : 0);
            }
        };
    });
    jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function (elem, computed) {
        if (computed) {
            return jQuery.swap(elem, { 'display': 'inline-block' }, curCSS, [
                elem,
                'marginRight'
            ]);
        }
    });
    jQuery.each({
        margin: '',
        padding: '',
        border: 'Width'
    }, function (prefix, suffix) {
        jQuery.cssHooks[prefix + suffix] = {
            expand: function (value) {
                var i = 0, expanded = {}, parts = typeof value === 'string' ? value.split(' ') : [value];
                for (; i < 4; i++) {
                    expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
                }
                return expanded;
            }
        };
        if (!rmargin.test(prefix)) {
            jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
        }
    });
    jQuery.fn.extend({
        css: function (name, value) {
            return access(this, function (elem, name, value) {
                var styles, len, map = {}, i = 0;
                if (jQuery.isArray(name)) {
                    styles = getStyles(elem);
                    len = name.length;
                    for (; i < len; i++) {
                        map[name[i]] = jQuery.css(elem, name[i], false, styles);
                    }
                    return map;
                }
                return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
            }, name, value, arguments.length > 1);
        },
        show: function () {
            return showHide(this, true);
        },
        hide: function () {
            return showHide(this);
        },
        toggle: function (state) {
            if (typeof state === 'boolean') {
                return state ? this.show() : this.hide();
            }
            return this.each(function () {
                if (isHidden(this)) {
                    jQuery(this).show();
                } else {
                    jQuery(this).hide();
                }
            });
        }
    });
    function Tween(elem, options, prop, end, easing) {
        return new Tween.prototype.init(elem, options, prop, end, easing);
    }
    jQuery.Tween = Tween;
    Tween.prototype = {
        constructor: Tween,
        init: function (elem, options, prop, end, easing, unit) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || 'swing';
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || (jQuery.cssNumber[prop] ? '' : 'px');
        },
        cur: function () {
            var hooks = Tween.propHooks[this.prop];
            return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
        },
        run: function (percent) {
            var eased, hooks = Tween.propHooks[this.prop];
            if (this.options.duration) {
                this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
            } else {
                this.pos = eased = percent;
            }
            this.now = (this.end - this.start) * eased + this.start;
            if (this.options.step) {
                this.options.step.call(this.elem, this.now, this);
            }
            if (hooks && hooks.set) {
                hooks.set(this);
            } else {
                Tween.propHooks._default.set(this);
            }
            return this;
        }
    };
    Tween.prototype.init.prototype = Tween.prototype;
    Tween.propHooks = {
        _default: {
            get: function (tween) {
                var result;
                if (tween.elem[tween.prop] != null && (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                    return tween.elem[tween.prop];
                }
                result = jQuery.css(tween.elem, tween.prop, '');
                return !result || result === 'auto' ? 0 : result;
            },
            set: function (tween) {
                if (jQuery.fx.step[tween.prop]) {
                    jQuery.fx.step[tween.prop](tween);
                } else if (tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
                    jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
                } else {
                    tween.elem[tween.prop] = tween.now;
                }
            }
        }
    };
    Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
        set: function (tween) {
            if (tween.elem.nodeType && tween.elem.parentNode) {
                tween.elem[tween.prop] = tween.now;
            }
        }
    };
    jQuery.easing = {
        linear: function (p) {
            return p;
        },
        swing: function (p) {
            return 0.5 - Math.cos(p * Math.PI) / 2;
        }
    };
    jQuery.fx = Tween.prototype.init;
    jQuery.fx.step = {};
    var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = new RegExp('^(?:([+-])=|)(' + pnum + ')([a-z%]*)$', 'i'), rrun = /queueHooks$/, animationPrefilters = [defaultPrefilter], tweeners = {
            '*': [function (prop, value) {
                    var tween = this.createTween(prop, value), target = tween.cur(), parts = rfxnum.exec(value), unit = parts && parts[3] || (jQuery.cssNumber[prop] ? '' : 'px'), start = (jQuery.cssNumber[prop] || unit !== 'px' && +target) && rfxnum.exec(jQuery.css(tween.elem, prop)), scale = 1, maxIterations = 20;
                    if (start && start[3] !== unit) {
                        unit = unit || start[3];
                        parts = parts || [];
                        start = +target || 1;
                        do {
                            scale = scale || '.5';
                            start = start / scale;
                            jQuery.style(tween.elem, prop, start + unit);
                        } while (scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations);
                    }
                    if (parts) {
                        start = tween.start = +start || +target || 0;
                        tween.unit = unit;
                        tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2];
                    }
                    return tween;
                }]
        };
    function createFxNow() {
        setTimeout(function () {
            fxNow = undefined;
        });
        return fxNow = jQuery.now();
    }
    function genFx(type, includeWidth) {
        var which, i = 0, attrs = { height: type };
        includeWidth = includeWidth ? 1 : 0;
        for (; i < 4; i += 2 - includeWidth) {
            which = cssExpand[i];
            attrs['margin' + which] = attrs['padding' + which] = type;
        }
        if (includeWidth) {
            attrs.opacity = attrs.width = type;
        }
        return attrs;
    }
    function createTween(value, prop, animation) {
        var tween, collection = (tweeners[prop] || []).concat(tweeners['*']), index = 0, length = collection.length;
        for (; index < length; index++) {
            if (tween = collection[index].call(animation, prop, value)) {
                return tween;
            }
        }
    }
    function defaultPrefilter(elem, props, opts) {
        var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHidden(elem), dataShow = data_priv.get(elem, 'fxshow');
        if (!opts.queue) {
            hooks = jQuery._queueHooks(elem, 'fx');
            if (hooks.unqueued == null) {
                hooks.unqueued = 0;
                oldfire = hooks.empty.fire;
                hooks.empty.fire = function () {
                    if (!hooks.unqueued) {
                        oldfire();
                    }
                };
            }
            hooks.unqueued++;
            anim.always(function () {
                anim.always(function () {
                    hooks.unqueued--;
                    if (!jQuery.queue(elem, 'fx').length) {
                        hooks.empty.fire();
                    }
                });
            });
        }
        if (elem.nodeType === 1 && ('height' in props || 'width' in props)) {
            opts.overflow = [
                style.overflow,
                style.overflowX,
                style.overflowY
            ];
            display = jQuery.css(elem, 'display');
            checkDisplay = display === 'none' ? data_priv.get(elem, 'olddisplay') || defaultDisplay(elem.nodeName) : display;
            if (checkDisplay === 'inline' && jQuery.css(elem, 'float') === 'none') {
                style.display = 'inline-block';
            }
        }
        if (opts.overflow) {
            style.overflow = 'hidden';
            anim.always(function () {
                style.overflow = opts.overflow[0];
                style.overflowX = opts.overflow[1];
                style.overflowY = opts.overflow[2];
            });
        }
        for (prop in props) {
            value = props[prop];
            if (rfxtypes.exec(value)) {
                delete props[prop];
                toggle = toggle || value === 'toggle';
                if (value === (hidden ? 'hide' : 'show')) {
                    if (value === 'show' && dataShow && dataShow[prop] !== undefined) {
                        hidden = true;
                    } else {
                        continue;
                    }
                }
                orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
            } else {
                display = undefined;
            }
        }
        if (!jQuery.isEmptyObject(orig)) {
            if (dataShow) {
                if ('hidden' in dataShow) {
                    hidden = dataShow.hidden;
                }
            } else {
                dataShow = data_priv.access(elem, 'fxshow', {});
            }
            if (toggle) {
                dataShow.hidden = !hidden;
            }
            if (hidden) {
                jQuery(elem).show();
            } else {
                anim.done(function () {
                    jQuery(elem).hide();
                });
            }
            anim.done(function () {
                var prop;
                data_priv.remove(elem, 'fxshow');
                for (prop in orig) {
                    jQuery.style(elem, prop, orig[prop]);
                }
            });
            for (prop in orig) {
                tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
                if (!(prop in dataShow)) {
                    dataShow[prop] = tween.start;
                    if (hidden) {
                        tween.end = tween.start;
                        tween.start = prop === 'width' || prop === 'height' ? 1 : 0;
                    }
                }
            }
        } else if ((display === 'none' ? defaultDisplay(elem.nodeName) : display) === 'inline') {
            style.display = display;
        }
    }
    function propFilter(props, specialEasing) {
        var index, name, easing, value, hooks;
        for (index in props) {
            name = jQuery.camelCase(index);
            easing = specialEasing[name];
            value = props[index];
            if (jQuery.isArray(value)) {
                easing = value[1];
                value = props[index] = value[0];
            }
            if (index !== name) {
                props[name] = value;
                delete props[index];
            }
            hooks = jQuery.cssHooks[name];
            if (hooks && 'expand' in hooks) {
                value = hooks.expand(value);
                delete props[name];
                for (index in value) {
                    if (!(index in props)) {
                        props[index] = value[index];
                        specialEasing[index] = easing;
                    }
                }
            } else {
                specialEasing[name] = easing;
            }
        }
    }
    function Animation(elem, properties, options) {
        var result, stopped, index = 0, length = animationPrefilters.length, deferred = jQuery.Deferred().always(function () {
                delete tick.elem;
            }), tick = function () {
                if (stopped) {
                    return false;
                }
                var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index = 0, length = animation.tweens.length;
                for (; index < length; index++) {
                    animation.tweens[index].run(percent);
                }
                deferred.notifyWith(elem, [
                    animation,
                    percent,
                    remaining
                ]);
                if (percent < 1 && length) {
                    return remaining;
                } else {
                    deferred.resolveWith(elem, [animation]);
                    return false;
                }
            }, animation = deferred.promise({
                elem: elem,
                props: jQuery.extend({}, properties),
                opts: jQuery.extend(true, { specialEasing: {} }, options),
                originalProperties: properties,
                originalOptions: options,
                startTime: fxNow || createFxNow(),
                duration: options.duration,
                tweens: [],
                createTween: function (prop, end) {
                    var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
                    animation.tweens.push(tween);
                    return tween;
                },
                stop: function (gotoEnd) {
                    var index = 0, length = gotoEnd ? animation.tweens.length : 0;
                    if (stopped) {
                        return this;
                    }
                    stopped = true;
                    for (; index < length; index++) {
                        animation.tweens[index].run(1);
                    }
                    if (gotoEnd) {
                        deferred.resolveWith(elem, [
                            animation,
                            gotoEnd
                        ]);
                    } else {
                        deferred.rejectWith(elem, [
                            animation,
                            gotoEnd
                        ]);
                    }
                    return this;
                }
            }), props = animation.props;
        propFilter(props, animation.opts.specialEasing);
        for (; index < length; index++) {
            result = animationPrefilters[index].call(animation, elem, props, animation.opts);
            if (result) {
                return result;
            }
        }
        jQuery.map(props, createTween, animation);
        if (jQuery.isFunction(animation.opts.start)) {
            animation.opts.start.call(elem, animation);
        }
        jQuery.fx.timer(jQuery.extend(tick, {
            elem: elem,
            anim: animation,
            queue: animation.opts.queue
        }));
        return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
    }
    jQuery.Animation = jQuery.extend(Animation, {
        tweener: function (props, callback) {
            if (jQuery.isFunction(props)) {
                callback = props;
                props = ['*'];
            } else {
                props = props.split(' ');
            }
            var prop, index = 0, length = props.length;
            for (; index < length; index++) {
                prop = props[index];
                tweeners[prop] = tweeners[prop] || [];
                tweeners[prop].unshift(callback);
            }
        },
        prefilter: function (callback, prepend) {
            if (prepend) {
                animationPrefilters.unshift(callback);
            } else {
                animationPrefilters.push(callback);
            }
        }
    });
    jQuery.speed = function (speed, easing, fn) {
        var opt = speed && typeof speed === 'object' ? jQuery.extend({}, speed) : {
            complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
            duration: speed,
            easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
        };
        opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === 'number' ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
        if (opt.queue == null || opt.queue === true) {
            opt.queue = 'fx';
        }
        opt.old = opt.complete;
        opt.complete = function () {
            if (jQuery.isFunction(opt.old)) {
                opt.old.call(this);
            }
            if (opt.queue) {
                jQuery.dequeue(this, opt.queue);
            }
        };
        return opt;
    };
    jQuery.fn.extend({
        fadeTo: function (speed, to, easing, callback) {
            return this.filter(isHidden).css('opacity', 0).show().end().animate({ opacity: to }, speed, easing, callback);
        },
        animate: function (prop, speed, easing, callback) {
            var empty = jQuery.isEmptyObject(prop), optall = jQuery.speed(speed, easing, callback), doAnimation = function () {
                    var anim = Animation(this, jQuery.extend({}, prop), optall);
                    if (empty || data_priv.get(this, 'finish')) {
                        anim.stop(true);
                    }
                };
            doAnimation.finish = doAnimation;
            return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
        },
        stop: function (type, clearQueue, gotoEnd) {
            var stopQueue = function (hooks) {
                var stop = hooks.stop;
                delete hooks.stop;
                stop(gotoEnd);
            };
            if (typeof type !== 'string') {
                gotoEnd = clearQueue;
                clearQueue = type;
                type = undefined;
            }
            if (clearQueue && type !== false) {
                this.queue(type || 'fx', []);
            }
            return this.each(function () {
                var dequeue = true, index = type != null && type + 'queueHooks', timers = jQuery.timers, data = data_priv.get(this);
                if (index) {
                    if (data[index] && data[index].stop) {
                        stopQueue(data[index]);
                    }
                } else {
                    for (index in data) {
                        if (data[index] && data[index].stop && rrun.test(index)) {
                            stopQueue(data[index]);
                        }
                    }
                }
                for (index = timers.length; index--;) {
                    if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                        timers[index].anim.stop(gotoEnd);
                        dequeue = false;
                        timers.splice(index, 1);
                    }
                }
                if (dequeue || !gotoEnd) {
                    jQuery.dequeue(this, type);
                }
            });
        },
        finish: function (type) {
            if (type !== false) {
                type = type || 'fx';
            }
            return this.each(function () {
                var index, data = data_priv.get(this), queue = data[type + 'queue'], hooks = data[type + 'queueHooks'], timers = jQuery.timers, length = queue ? queue.length : 0;
                data.finish = true;
                jQuery.queue(this, type, []);
                if (hooks && hooks.stop) {
                    hooks.stop.call(this, true);
                }
                for (index = timers.length; index--;) {
                    if (timers[index].elem === this && timers[index].queue === type) {
                        timers[index].anim.stop(true);
                        timers.splice(index, 1);
                    }
                }
                for (index = 0; index < length; index++) {
                    if (queue[index] && queue[index].finish) {
                        queue[index].finish.call(this);
                    }
                }
                delete data.finish;
            });
        }
    });
    jQuery.each([
        'toggle',
        'show',
        'hide'
    ], function (i, name) {
        var cssFn = jQuery.fn[name];
        jQuery.fn[name] = function (speed, easing, callback) {
            return speed == null || typeof speed === 'boolean' ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
        };
    });
    jQuery.each({
        slideDown: genFx('show'),
        slideUp: genFx('hide'),
        slideToggle: genFx('toggle'),
        fadeIn: { opacity: 'show' },
        fadeOut: { opacity: 'hide' },
        fadeToggle: { opacity: 'toggle' }
    }, function (name, props) {
        jQuery.fn[name] = function (speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
        };
    });
    jQuery.timers = [];
    jQuery.fx.tick = function () {
        var timer, i = 0, timers = jQuery.timers;
        fxNow = jQuery.now();
        for (; i < timers.length; i++) {
            timer = timers[i];
            if (!timer() && timers[i] === timer) {
                timers.splice(i--, 1);
            }
        }
        if (!timers.length) {
            jQuery.fx.stop();
        }
        fxNow = undefined;
    };
    jQuery.fx.timer = function (timer) {
        jQuery.timers.push(timer);
        if (timer()) {
            jQuery.fx.start();
        } else {
            jQuery.timers.pop();
        }
    };
    jQuery.fx.interval = 13;
    jQuery.fx.start = function () {
        if (!timerId) {
            timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
        }
    };
    jQuery.fx.stop = function () {
        clearInterval(timerId);
        timerId = null;
    };
    jQuery.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    };
    jQuery.fn.delay = function (time, type) {
        time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
        type = type || 'fx';
        return this.queue(type, function (next, hooks) {
            var timeout = setTimeout(next, time);
            hooks.stop = function () {
                clearTimeout(timeout);
            };
        });
    };
    (function () {
        var input = document.createElement('input'), select = document.createElement('select'), opt = select.appendChild(document.createElement('option'));
        input.type = 'checkbox';
        support.checkOn = input.value !== '';
        support.optSelected = opt.selected;
        select.disabled = true;
        support.optDisabled = !opt.disabled;
        input = document.createElement('input');
        input.value = 't';
        input.type = 'radio';
        support.radioValue = input.value === 't';
    }());
    var nodeHook, boolHook, attrHandle = jQuery.expr.attrHandle;
    jQuery.fn.extend({
        attr: function (name, value) {
            return access(this, jQuery.attr, name, value, arguments.length > 1);
        },
        removeAttr: function (name) {
            return this.each(function () {
                jQuery.removeAttr(this, name);
            });
        }
    });
    jQuery.extend({
        attr: function (elem, name, value) {
            var hooks, ret, nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return;
            }
            if (typeof elem.getAttribute === strundefined) {
                return jQuery.prop(elem, name, value);
            }
            if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
                name = name.toLowerCase();
                hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook);
            }
            if (value !== undefined) {
                if (value === null) {
                    jQuery.removeAttr(elem, name);
                } else if (hooks && 'set' in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                    return ret;
                } else {
                    elem.setAttribute(name, value + '');
                    return value;
                }
            } else if (hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null) {
                return ret;
            } else {
                ret = jQuery.find.attr(elem, name);
                return ret == null ? undefined : ret;
            }
        },
        removeAttr: function (elem, value) {
            var name, propName, i = 0, attrNames = value && value.match(rnotwhite);
            if (attrNames && elem.nodeType === 1) {
                while (name = attrNames[i++]) {
                    propName = jQuery.propFix[name] || name;
                    if (jQuery.expr.match.bool.test(name)) {
                        elem[propName] = false;
                    }
                    elem.removeAttribute(name);
                }
            }
        },
        attrHooks: {
            type: {
                set: function (elem, value) {
                    if (!support.radioValue && value === 'radio' && jQuery.nodeName(elem, 'input')) {
                        var val = elem.value;
                        elem.setAttribute('type', value);
                        if (val) {
                            elem.value = val;
                        }
                        return value;
                    }
                }
            }
        }
    });
    boolHook = {
        set: function (elem, value, name) {
            if (value === false) {
                jQuery.removeAttr(elem, name);
            } else {
                elem.setAttribute(name, name);
            }
            return name;
        }
    };
    jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function (i, name) {
        var getter = attrHandle[name] || jQuery.find.attr;
        attrHandle[name] = function (elem, name, isXML) {
            var ret, handle;
            if (!isXML) {
                handle = attrHandle[name];
                attrHandle[name] = ret;
                ret = getter(elem, name, isXML) != null ? name.toLowerCase() : null;
                attrHandle[name] = handle;
            }
            return ret;
        };
    });
    var rfocusable = /^(?:input|select|textarea|button)$/i;
    jQuery.fn.extend({
        prop: function (name, value) {
            return access(this, jQuery.prop, name, value, arguments.length > 1);
        },
        removeProp: function (name) {
            return this.each(function () {
                delete this[jQuery.propFix[name] || name];
            });
        }
    });
    jQuery.extend({
        propFix: {
            'for': 'htmlFor',
            'class': 'className'
        },
        prop: function (elem, name, value) {
            var ret, hooks, notxml, nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return;
            }
            notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
            if (notxml) {
                name = jQuery.propFix[name] || name;
                hooks = jQuery.propHooks[name];
            }
            if (value !== undefined) {
                return hooks && 'set' in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : elem[name] = value;
            } else {
                return hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
            }
        },
        propHooks: {
            tabIndex: {
                get: function (elem) {
                    return elem.hasAttribute('tabindex') || rfocusable.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
                }
            }
        }
    });
    if (!support.optSelected) {
        jQuery.propHooks.selected = {
            get: function (elem) {
                var parent = elem.parentNode;
                if (parent && parent.parentNode) {
                    parent.parentNode.selectedIndex;
                }
                return null;
            }
        };
    }
    jQuery.each([
        'tabIndex',
        'readOnly',
        'maxLength',
        'cellSpacing',
        'cellPadding',
        'rowSpan',
        'colSpan',
        'useMap',
        'frameBorder',
        'contentEditable'
    ], function () {
        jQuery.propFix[this.toLowerCase()] = this;
    });
    var rclass = /[\t\r\n\f]/g;
    jQuery.fn.extend({
        addClass: function (value) {
            var classes, elem, cur, clazz, j, finalValue, proceed = typeof value === 'string' && value, i = 0, len = this.length;
            if (jQuery.isFunction(value)) {
                return this.each(function (j) {
                    jQuery(this).addClass(value.call(this, j, this.className));
                });
            }
            if (proceed) {
                classes = (value || '').match(rnotwhite) || [];
                for (; i < len; i++) {
                    elem = this[i];
                    cur = elem.nodeType === 1 && (elem.className ? (' ' + elem.className + ' ').replace(rclass, ' ') : ' ');
                    if (cur) {
                        j = 0;
                        while (clazz = classes[j++]) {
                            if (cur.indexOf(' ' + clazz + ' ') < 0) {
                                cur += clazz + ' ';
                            }
                        }
                        finalValue = jQuery.trim(cur);
                        if (elem.className !== finalValue) {
                            elem.className = finalValue;
                        }
                    }
                }
            }
            return this;
        },
        removeClass: function (value) {
            var classes, elem, cur, clazz, j, finalValue, proceed = arguments.length === 0 || typeof value === 'string' && value, i = 0, len = this.length;
            if (jQuery.isFunction(value)) {
                return this.each(function (j) {
                    jQuery(this).removeClass(value.call(this, j, this.className));
                });
            }
            if (proceed) {
                classes = (value || '').match(rnotwhite) || [];
                for (; i < len; i++) {
                    elem = this[i];
                    cur = elem.nodeType === 1 && (elem.className ? (' ' + elem.className + ' ').replace(rclass, ' ') : '');
                    if (cur) {
                        j = 0;
                        while (clazz = classes[j++]) {
                            while (cur.indexOf(' ' + clazz + ' ') >= 0) {
                                cur = cur.replace(' ' + clazz + ' ', ' ');
                            }
                        }
                        finalValue = value ? jQuery.trim(cur) : '';
                        if (elem.className !== finalValue) {
                            elem.className = finalValue;
                        }
                    }
                }
            }
            return this;
        },
        toggleClass: function (value, stateVal) {
            var type = typeof value;
            if (typeof stateVal === 'boolean' && type === 'string') {
                return stateVal ? this.addClass(value) : this.removeClass(value);
            }
            if (jQuery.isFunction(value)) {
                return this.each(function (i) {
                    jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
                });
            }
            return this.each(function () {
                if (type === 'string') {
                    var className, i = 0, self = jQuery(this), classNames = value.match(rnotwhite) || [];
                    while (className = classNames[i++]) {
                        if (self.hasClass(className)) {
                            self.removeClass(className);
                        } else {
                            self.addClass(className);
                        }
                    }
                } else if (type === strundefined || type === 'boolean') {
                    if (this.className) {
                        data_priv.set(this, '__className__', this.className);
                    }
                    this.className = this.className || value === false ? '' : data_priv.get(this, '__className__') || '';
                }
            });
        },
        hasClass: function (selector) {
            var className = ' ' + selector + ' ', i = 0, l = this.length;
            for (; i < l; i++) {
                if (this[i].nodeType === 1 && (' ' + this[i].className + ' ').replace(rclass, ' ').indexOf(className) >= 0) {
                    return true;
                }
            }
            return false;
        }
    });
    var rreturn = /\r/g;
    jQuery.fn.extend({
        val: function (value) {
            var hooks, ret, isFunction, elem = this[0];
            if (!arguments.length) {
                if (elem) {
                    hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];
                    if (hooks && 'get' in hooks && (ret = hooks.get(elem, 'value')) !== undefined) {
                        return ret;
                    }
                    ret = elem.value;
                    return typeof ret === 'string' ? ret.replace(rreturn, '') : ret == null ? '' : ret;
                }
                return;
            }
            isFunction = jQuery.isFunction(value);
            return this.each(function (i) {
                var val;
                if (this.nodeType !== 1) {
                    return;
                }
                if (isFunction) {
                    val = value.call(this, i, jQuery(this).val());
                } else {
                    val = value;
                }
                if (val == null) {
                    val = '';
                } else if (typeof val === 'number') {
                    val += '';
                } else if (jQuery.isArray(val)) {
                    val = jQuery.map(val, function (value) {
                        return value == null ? '' : value + '';
                    });
                }
                hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
                if (!hooks || !('set' in hooks) || hooks.set(this, val, 'value') === undefined) {
                    this.value = val;
                }
            });
        }
    });
    jQuery.extend({
        valHooks: {
            option: {
                get: function (elem) {
                    var val = jQuery.find.attr(elem, 'value');
                    return val != null ? val : jQuery.trim(jQuery.text(elem));
                }
            },
            select: {
                get: function (elem) {
                    var value, option, options = elem.options, index = elem.selectedIndex, one = elem.type === 'select-one' || index < 0, values = one ? null : [], max = one ? index + 1 : options.length, i = index < 0 ? max : one ? index : 0;
                    for (; i < max; i++) {
                        option = options[i];
                        if ((option.selected || i === index) && (support.optDisabled ? !option.disabled : option.getAttribute('disabled') === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, 'optgroup'))) {
                            value = jQuery(option).val();
                            if (one) {
                                return value;
                            }
                            values.push(value);
                        }
                    }
                    return values;
                },
                set: function (elem, value) {
                    var optionSet, option, options = elem.options, values = jQuery.makeArray(value), i = options.length;
                    while (i--) {
                        option = options[i];
                        if (option.selected = jQuery.inArray(option.value, values) >= 0) {
                            optionSet = true;
                        }
                    }
                    if (!optionSet) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }
        }
    });
    jQuery.each([
        'radio',
        'checkbox'
    ], function () {
        jQuery.valHooks[this] = {
            set: function (elem, value) {
                if (jQuery.isArray(value)) {
                    return elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0;
                }
            }
        };
        if (!support.checkOn) {
            jQuery.valHooks[this].get = function (elem) {
                return elem.getAttribute('value') === null ? 'on' : elem.value;
            };
        }
    });
    jQuery.each(('blur focus focusin focusout load resize scroll unload click dblclick ' + 'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' + 'change select submit keydown keypress keyup error contextmenu').split(' '), function (i, name) {
        jQuery.fn[name] = function (data, fn) {
            return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
        };
    });
    jQuery.fn.extend({
        hover: function (fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
        },
        bind: function (types, data, fn) {
            return this.on(types, null, data, fn);
        },
        unbind: function (types, fn) {
            return this.off(types, null, fn);
        },
        delegate: function (selector, types, data, fn) {
            return this.on(types, selector, data, fn);
        },
        undelegate: function (selector, types, fn) {
            return arguments.length === 1 ? this.off(selector, '**') : this.off(types, selector || '**', fn);
        }
    });
    var nonce = jQuery.now();
    var rquery = /\?/;
    jQuery.parseJSON = function (data) {
        return JSON.parse(data + '');
    };
    jQuery.parseXML = function (data) {
        var xml, tmp;
        if (!data || typeof data !== 'string') {
            return null;
        }
        try {
            tmp = new DOMParser();
            xml = tmp.parseFromString(data, 'text/xml');
        } catch (e) {
            xml = undefined;
        }
        if (!xml || xml.getElementsByTagName('parsererror').length) {
            jQuery.error('Invalid XML: ' + data);
        }
        return xml;
    };
    var rhash = /#.*$/, rts = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)$/gm, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, prefilters = {}, transports = {}, allTypes = '*/'.concat('*'), ajaxLocation = window.location.href, ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
    function addToPrefiltersOrTransports(structure) {
        return function (dataTypeExpression, func) {
            if (typeof dataTypeExpression !== 'string') {
                func = dataTypeExpression;
                dataTypeExpression = '*';
            }
            var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
            if (jQuery.isFunction(func)) {
                while (dataType = dataTypes[i++]) {
                    if (dataType[0] === '+') {
                        dataType = dataType.slice(1) || '*';
                        (structure[dataType] = structure[dataType] || []).unshift(func);
                    } else {
                        (structure[dataType] = structure[dataType] || []).push(func);
                    }
                }
            }
        };
    }
    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
        var inspected = {}, seekingTransport = structure === transports;
        function inspect(dataType) {
            var selected;
            inspected[dataType] = true;
            jQuery.each(structure[dataType] || [], function (_, prefilterOrFactory) {
                var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
                if (typeof dataTypeOrTransport === 'string' && !seekingTransport && !inspected[dataTypeOrTransport]) {
                    options.dataTypes.unshift(dataTypeOrTransport);
                    inspect(dataTypeOrTransport);
                    return false;
                } else if (seekingTransport) {
                    return !(selected = dataTypeOrTransport);
                }
            });
            return selected;
        }
        return inspect(options.dataTypes[0]) || !inspected['*'] && inspect('*');
    }
    function ajaxExtend(target, src) {
        var key, deep, flatOptions = jQuery.ajaxSettings.flatOptions || {};
        for (key in src) {
            if (src[key] !== undefined) {
                (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
            }
        }
        if (deep) {
            jQuery.extend(true, target, deep);
        }
        return target;
    }
    function ajaxHandleResponses(s, jqXHR, responses) {
        var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes;
        while (dataTypes[0] === '*') {
            dataTypes.shift();
            if (ct === undefined) {
                ct = s.mimeType || jqXHR.getResponseHeader('Content-Type');
            }
        }
        if (ct) {
            for (type in contents) {
                if (contents[type] && contents[type].test(ct)) {
                    dataTypes.unshift(type);
                    break;
                }
            }
        }
        if (dataTypes[0] in responses) {
            finalDataType = dataTypes[0];
        } else {
            for (type in responses) {
                if (!dataTypes[0] || s.converters[type + ' ' + dataTypes[0]]) {
                    finalDataType = type;
                    break;
                }
                if (!firstDataType) {
                    firstDataType = type;
                }
            }
            finalDataType = finalDataType || firstDataType;
        }
        if (finalDataType) {
            if (finalDataType !== dataTypes[0]) {
                dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
        }
    }
    function ajaxConvert(s, response, jqXHR, isSuccess) {
        var conv2, current, conv, tmp, prev, converters = {}, dataTypes = s.dataTypes.slice();
        if (dataTypes[1]) {
            for (conv in s.converters) {
                converters[conv.toLowerCase()] = s.converters[conv];
            }
        }
        current = dataTypes.shift();
        while (current) {
            if (s.responseFields[current]) {
                jqXHR[s.responseFields[current]] = response;
            }
            if (!prev && isSuccess && s.dataFilter) {
                response = s.dataFilter(response, s.dataType);
            }
            prev = current;
            current = dataTypes.shift();
            if (current) {
                if (current === '*') {
                    current = prev;
                } else if (prev !== '*' && prev !== current) {
                    conv = converters[prev + ' ' + current] || converters['* ' + current];
                    if (!conv) {
                        for (conv2 in converters) {
                            tmp = conv2.split(' ');
                            if (tmp[1] === current) {
                                conv = converters[prev + ' ' + tmp[0]] || converters['* ' + tmp[0]];
                                if (conv) {
                                    if (conv === true) {
                                        conv = converters[conv2];
                                    } else if (converters[conv2] !== true) {
                                        current = tmp[0];
                                        dataTypes.unshift(tmp[1]);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (conv !== true) {
                        if (conv && s['throws']) {
                            response = conv(response);
                        } else {
                            try {
                                response = conv(response);
                            } catch (e) {
                                return {
                                    state: 'parsererror',
                                    error: conv ? e : 'No conversion from ' + prev + ' to ' + current
                                };
                            }
                        }
                    }
                }
            }
        }
        return {
            state: 'success',
            data: response
        };
    }
    jQuery.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: ajaxLocation,
            type: 'GET',
            isLocal: rlocalProtocol.test(ajaxLocParts[1]),
            global: true,
            processData: true,
            async: true,
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            accepts: {
                '*': allTypes,
                text: 'text/plain',
                html: 'text/html',
                xml: 'application/xml, text/xml',
                json: 'application/json, text/javascript'
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: 'responseXML',
                text: 'responseText',
                json: 'responseJSON'
            },
            converters: {
                '* text': String,
                'text html': true,
                'text json': jQuery.parseJSON,
                'text xml': jQuery.parseXML
            },
            flatOptions: {
                url: true,
                context: true
            }
        },
        ajaxSetup: function (target, settings) {
            return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target);
        },
        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
        ajaxTransport: addToPrefiltersOrTransports(transports),
        ajax: function (url, options) {
            if (typeof url === 'object') {
                options = url;
                url = undefined;
            }
            options = options || {};
            var transport, cacheURL, responseHeadersString, responseHeaders, timeoutTimer, parts, fireGlobals, i, s = jQuery.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event, deferred = jQuery.Deferred(), completeDeferred = jQuery.Callbacks('once memory'), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, state = 0, strAbort = 'canceled', jqXHR = {
                    readyState: 0,
                    getResponseHeader: function (key) {
                        var match;
                        if (state === 2) {
                            if (!responseHeaders) {
                                responseHeaders = {};
                                while (match = rheaders.exec(responseHeadersString)) {
                                    responseHeaders[match[1].toLowerCase()] = match[2];
                                }
                            }
                            match = responseHeaders[key.toLowerCase()];
                        }
                        return match == null ? null : match;
                    },
                    getAllResponseHeaders: function () {
                        return state === 2 ? responseHeadersString : null;
                    },
                    setRequestHeader: function (name, value) {
                        var lname = name.toLowerCase();
                        if (!state) {
                            name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                            requestHeaders[name] = value;
                        }
                        return this;
                    },
                    overrideMimeType: function (type) {
                        if (!state) {
                            s.mimeType = type;
                        }
                        return this;
                    },
                    statusCode: function (map) {
                        var code;
                        if (map) {
                            if (state < 2) {
                                for (code in map) {
                                    statusCode[code] = [
                                        statusCode[code],
                                        map[code]
                                    ];
                                }
                            } else {
                                jqXHR.always(map[jqXHR.status]);
                            }
                        }
                        return this;
                    },
                    abort: function (statusText) {
                        var finalText = statusText || strAbort;
                        if (transport) {
                            transport.abort(finalText);
                        }
                        done(0, finalText);
                        return this;
                    }
                };
            deferred.promise(jqXHR).complete = completeDeferred.add;
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            s.url = ((url || s.url || ajaxLocation) + '').replace(rhash, '').replace(rprotocol, ajaxLocParts[1] + '//');
            s.type = options.method || options.type || s.method || s.type;
            s.dataTypes = jQuery.trim(s.dataType || '*').toLowerCase().match(rnotwhite) || [''];
            if (s.crossDomain == null) {
                parts = rurl.exec(s.url.toLowerCase());
                s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === 'http:' ? '80' : '443')) !== (ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? '80' : '443'))));
            }
            if (s.data && s.processData && typeof s.data !== 'string') {
                s.data = jQuery.param(s.data, s.traditional);
            }
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
            if (state === 2) {
                return jqXHR;
            }
            fireGlobals = jQuery.event && s.global;
            if (fireGlobals && jQuery.active++ === 0) {
                jQuery.event.trigger('ajaxStart');
            }
            s.type = s.type.toUpperCase();
            s.hasContent = !rnoContent.test(s.type);
            cacheURL = s.url;
            if (!s.hasContent) {
                if (s.data) {
                    cacheURL = s.url += (rquery.test(cacheURL) ? '&' : '?') + s.data;
                    delete s.data;
                }
                if (s.cache === false) {
                    s.url = rts.test(cacheURL) ? cacheURL.replace(rts, '$1_=' + nonce++) : cacheURL + (rquery.test(cacheURL) ? '&' : '?') + '_=' + nonce++;
                }
            }
            if (s.ifModified) {
                if (jQuery.lastModified[cacheURL]) {
                    jqXHR.setRequestHeader('If-Modified-Since', jQuery.lastModified[cacheURL]);
                }
                if (jQuery.etag[cacheURL]) {
                    jqXHR.setRequestHeader('If-None-Match', jQuery.etag[cacheURL]);
                }
            }
            if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
                jqXHR.setRequestHeader('Content-Type', s.contentType);
            }
            jqXHR.setRequestHeader('Accept', s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== '*' ? ', ' + allTypes + '; q=0.01' : '') : s.accepts['*']);
            for (i in s.headers) {
                jqXHR.setRequestHeader(i, s.headers[i]);
            }
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
                return jqXHR.abort();
            }
            strAbort = 'abort';
            for (i in {
                    success: 1,
                    error: 1,
                    complete: 1
                }) {
                jqXHR[i](s[i]);
            }
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
            if (!transport) {
                done(-1, 'No Transport');
            } else {
                jqXHR.readyState = 1;
                if (fireGlobals) {
                    globalEventContext.trigger('ajaxSend', [
                        jqXHR,
                        s
                    ]);
                }
                if (s.async && s.timeout > 0) {
                    timeoutTimer = setTimeout(function () {
                        jqXHR.abort('timeout');
                    }, s.timeout);
                }
                try {
                    state = 1;
                    transport.send(requestHeaders, done);
                } catch (e) {
                    if (state < 2) {
                        done(-1, e);
                    } else {
                        throw e;
                    }
                }
            }
            function done(status, nativeStatusText, responses, headers) {
                var isSuccess, success, error, response, modified, statusText = nativeStatusText;
                if (state === 2) {
                    return;
                }
                state = 2;
                if (timeoutTimer) {
                    clearTimeout(timeoutTimer);
                }
                transport = undefined;
                responseHeadersString = headers || '';
                jqXHR.readyState = status > 0 ? 4 : 0;
                isSuccess = status >= 200 && status < 300 || status === 304;
                if (responses) {
                    response = ajaxHandleResponses(s, jqXHR, responses);
                }
                response = ajaxConvert(s, response, jqXHR, isSuccess);
                if (isSuccess) {
                    if (s.ifModified) {
                        modified = jqXHR.getResponseHeader('Last-Modified');
                        if (modified) {
                            jQuery.lastModified[cacheURL] = modified;
                        }
                        modified = jqXHR.getResponseHeader('etag');
                        if (modified) {
                            jQuery.etag[cacheURL] = modified;
                        }
                    }
                    if (status === 204 || s.type === 'HEAD') {
                        statusText = 'nocontent';
                    } else if (status === 304) {
                        statusText = 'notmodified';
                    } else {
                        statusText = response.state;
                        success = response.data;
                        error = response.error;
                        isSuccess = !error;
                    }
                } else {
                    error = statusText;
                    if (status || !statusText) {
                        statusText = 'error';
                        if (status < 0) {
                            status = 0;
                        }
                    }
                }
                jqXHR.status = status;
                jqXHR.statusText = (nativeStatusText || statusText) + '';
                if (isSuccess) {
                    deferred.resolveWith(callbackContext, [
                        success,
                        statusText,
                        jqXHR
                    ]);
                } else {
                    deferred.rejectWith(callbackContext, [
                        jqXHR,
                        statusText,
                        error
                    ]);
                }
                jqXHR.statusCode(statusCode);
                statusCode = undefined;
                if (fireGlobals) {
                    globalEventContext.trigger(isSuccess ? 'ajaxSuccess' : 'ajaxError', [
                        jqXHR,
                        s,
                        isSuccess ? success : error
                    ]);
                }
                completeDeferred.fireWith(callbackContext, [
                    jqXHR,
                    statusText
                ]);
                if (fireGlobals) {
                    globalEventContext.trigger('ajaxComplete', [
                        jqXHR,
                        s
                    ]);
                    if (!--jQuery.active) {
                        jQuery.event.trigger('ajaxStop');
                    }
                }
            }
            return jqXHR;
        },
        getJSON: function (url, data, callback) {
            return jQuery.get(url, data, callback, 'json');
        },
        getScript: function (url, callback) {
            return jQuery.get(url, undefined, callback, 'script');
        }
    });
    jQuery.each([
        'get',
        'post'
    ], function (i, method) {
        jQuery[method] = function (url, data, callback, type) {
            if (jQuery.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            return jQuery.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });
    jQuery._evalUrl = function (url) {
        return jQuery.ajax({
            url: url,
            type: 'GET',
            dataType: 'script',
            async: false,
            global: false,
            'throws': true
        });
    };
    jQuery.fn.extend({
        wrapAll: function (html) {
            var wrap;
            if (jQuery.isFunction(html)) {
                return this.each(function (i) {
                    jQuery(this).wrapAll(html.call(this, i));
                });
            }
            if (this[0]) {
                wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
                if (this[0].parentNode) {
                    wrap.insertBefore(this[0]);
                }
                wrap.map(function () {
                    var elem = this;
                    while (elem.firstElementChild) {
                        elem = elem.firstElementChild;
                    }
                    return elem;
                }).append(this);
            }
            return this;
        },
        wrapInner: function (html) {
            if (jQuery.isFunction(html)) {
                return this.each(function (i) {
                    jQuery(this).wrapInner(html.call(this, i));
                });
            }
            return this.each(function () {
                var self = jQuery(this), contents = self.contents();
                if (contents.length) {
                    contents.wrapAll(html);
                } else {
                    self.append(html);
                }
            });
        },
        wrap: function (html) {
            var isFunction = jQuery.isFunction(html);
            return this.each(function (i) {
                jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
            });
        },
        unwrap: function () {
            return this.parent().each(function () {
                if (!jQuery.nodeName(this, 'body')) {
                    jQuery(this).replaceWith(this.childNodes);
                }
            }).end();
        }
    });
    jQuery.expr.filters.hidden = function (elem) {
        return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
    };
    jQuery.expr.filters.visible = function (elem) {
        return !jQuery.expr.filters.hidden(elem);
    };
    var r20 = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
    function buildParams(prefix, obj, traditional, add) {
        var name;
        if (jQuery.isArray(obj)) {
            jQuery.each(obj, function (i, v) {
                if (traditional || rbracket.test(prefix)) {
                    add(prefix, v);
                } else {
                    buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add);
                }
            });
        } else if (!traditional && jQuery.type(obj) === 'object') {
            for (name in obj) {
                buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
            }
        } else {
            add(prefix, obj);
        }
    }
    jQuery.param = function (a, traditional) {
        var prefix, s = [], add = function (key, value) {
                value = jQuery.isFunction(value) ? value() : value == null ? '' : value;
                s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
            };
        if (traditional === undefined) {
            traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
        }
        if (jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) {
            jQuery.each(a, function () {
                add(this.name, this.value);
            });
        } else {
            for (prefix in a) {
                buildParams(prefix, a[prefix], traditional, add);
            }
        }
        return s.join('&').replace(r20, '+');
    };
    jQuery.fn.extend({
        serialize: function () {
            return jQuery.param(this.serializeArray());
        },
        serializeArray: function () {
            return this.map(function () {
                var elements = jQuery.prop(this, 'elements');
                return elements ? jQuery.makeArray(elements) : this;
            }).filter(function () {
                var type = this.type;
                return this.name && !jQuery(this).is(':disabled') && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
            }).map(function (i, elem) {
                var val = jQuery(this).val();
                return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function (val) {
                    return {
                        name: elem.name,
                        value: val.replace(rCRLF, '\r\n')
                    };
                }) : {
                    name: elem.name,
                    value: val.replace(rCRLF, '\r\n')
                };
            }).get();
        }
    });
    jQuery.ajaxSettings.xhr = function () {
        try {
            return new XMLHttpRequest();
        } catch (e) {
        }
    };
    var xhrId = 0, xhrCallbacks = {}, xhrSuccessStatus = {
            0: 200,
            1223: 204
        }, xhrSupported = jQuery.ajaxSettings.xhr();
    if (window.attachEvent) {
        window.attachEvent('onunload', function () {
            for (var key in xhrCallbacks) {
                xhrCallbacks[key]();
            }
        });
    }
    support.cors = !!xhrSupported && 'withCredentials' in xhrSupported;
    support.ajax = xhrSupported = !!xhrSupported;
    jQuery.ajaxTransport(function (options) {
        var callback;
        if (support.cors || xhrSupported && !options.crossDomain) {
            return {
                send: function (headers, complete) {
                    var i, xhr = options.xhr(), id = ++xhrId;
                    xhr.open(options.type, options.url, options.async, options.username, options.password);
                    if (options.xhrFields) {
                        for (i in options.xhrFields) {
                            xhr[i] = options.xhrFields[i];
                        }
                    }
                    if (options.mimeType && xhr.overrideMimeType) {
                        xhr.overrideMimeType(options.mimeType);
                    }
                    if (!options.crossDomain && !headers['X-Requested-With']) {
                        headers['X-Requested-With'] = 'XMLHttpRequest';
                    }
                    for (i in headers) {
                        xhr.setRequestHeader(i, headers[i]);
                    }
                    callback = function (type) {
                        return function () {
                            if (callback) {
                                delete xhrCallbacks[id];
                                callback = xhr.onload = xhr.onerror = null;
                                if (type === 'abort') {
                                    xhr.abort();
                                } else if (type === 'error') {
                                    complete(xhr.status, xhr.statusText);
                                } else {
                                    complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText, typeof xhr.responseText === 'string' ? { text: xhr.responseText } : undefined, xhr.getAllResponseHeaders());
                                }
                            }
                        };
                    };
                    xhr.onload = callback();
                    xhr.onerror = callback('error');
                    callback = xhrCallbacks[id] = callback('abort');
                    try {
                        xhr.send(options.hasContent && options.data || null);
                    } catch (e) {
                        if (callback) {
                            throw e;
                        }
                    }
                },
                abort: function () {
                    if (callback) {
                        callback();
                    }
                }
            };
        }
    });
    jQuery.ajaxSetup({
        accepts: { script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript' },
        contents: { script: /(?:java|ecma)script/ },
        converters: {
            'text script': function (text) {
                jQuery.globalEval(text);
                return text;
            }
        }
    });
    jQuery.ajaxPrefilter('script', function (s) {
        if (s.cache === undefined) {
            s.cache = false;
        }
        if (s.crossDomain) {
            s.type = 'GET';
        }
    });
    jQuery.ajaxTransport('script', function (s) {
        if (s.crossDomain) {
            var script, callback;
            return {
                send: function (_, complete) {
                    script = jQuery('<script>').prop({
                        async: true,
                        charset: s.scriptCharset,
                        src: s.url
                    }).on('load error', callback = function (evt) {
                        script.remove();
                        callback = null;
                        if (evt) {
                            complete(evt.type === 'error' ? 404 : 200, evt.type);
                        }
                    });
                    document.head.appendChild(script[0]);
                },
                abort: function () {
                    if (callback) {
                        callback();
                    }
                }
            };
        }
    });
    var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
    jQuery.ajaxSetup({
        jsonp: 'callback',
        jsonpCallback: function () {
            var callback = oldCallbacks.pop() || jQuery.expando + '_' + nonce++;
            this[callback] = true;
            return callback;
        }
    });
    jQuery.ajaxPrefilter('json jsonp', function (s, originalSettings, jqXHR) {
        var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? 'url' : typeof s.data === 'string' && !(s.contentType || '').indexOf('application/x-www-form-urlencoded') && rjsonp.test(s.data) && 'data');
        if (jsonProp || s.dataTypes[0] === 'jsonp') {
            callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
            if (jsonProp) {
                s[jsonProp] = s[jsonProp].replace(rjsonp, '$1' + callbackName);
            } else if (s.jsonp !== false) {
                s.url += (rquery.test(s.url) ? '&' : '?') + s.jsonp + '=' + callbackName;
            }
            s.converters['script json'] = function () {
                if (!responseContainer) {
                    jQuery.error(callbackName + ' was not called');
                }
                return responseContainer[0];
            };
            s.dataTypes[0] = 'json';
            overwritten = window[callbackName];
            window[callbackName] = function () {
                responseContainer = arguments;
            };
            jqXHR.always(function () {
                window[callbackName] = overwritten;
                if (s[callbackName]) {
                    s.jsonpCallback = originalSettings.jsonpCallback;
                    oldCallbacks.push(callbackName);
                }
                if (responseContainer && jQuery.isFunction(overwritten)) {
                    overwritten(responseContainer[0]);
                }
                responseContainer = overwritten = undefined;
            });
            return 'script';
        }
    });
    jQuery.parseHTML = function (data, context, keepScripts) {
        if (!data || typeof data !== 'string') {
            return null;
        }
        if (typeof context === 'boolean') {
            keepScripts = context;
            context = false;
        }
        context = context || document;
        var parsed = rsingleTag.exec(data), scripts = !keepScripts && [];
        if (parsed) {
            return [context.createElement(parsed[1])];
        }
        parsed = jQuery.buildFragment([data], context, scripts);
        if (scripts && scripts.length) {
            jQuery(scripts).remove();
        }
        return jQuery.merge([], parsed.childNodes);
    };
    var _load = jQuery.fn.load;
    jQuery.fn.load = function (url, params, callback) {
        if (typeof url !== 'string' && _load) {
            return _load.apply(this, arguments);
        }
        var selector, type, response, self = this, off = url.indexOf(' ');
        if (off >= 0) {
            selector = jQuery.trim(url.slice(off));
            url = url.slice(0, off);
        }
        if (jQuery.isFunction(params)) {
            callback = params;
            params = undefined;
        } else if (params && typeof params === 'object') {
            type = 'POST';
        }
        if (self.length > 0) {
            jQuery.ajax({
                url: url,
                type: type,
                dataType: 'html',
                data: params
            }).done(function (responseText) {
                response = arguments;
                self.html(selector ? jQuery('<div>').append(jQuery.parseHTML(responseText)).find(selector) : responseText);
            }).complete(callback && function (jqXHR, status) {
                self.each(callback, response || [
                    jqXHR.responseText,
                    status,
                    jqXHR
                ]);
            });
        }
        return this;
    };
    jQuery.each([
        'ajaxStart',
        'ajaxStop',
        'ajaxComplete',
        'ajaxError',
        'ajaxSuccess',
        'ajaxSend'
    ], function (i, type) {
        jQuery.fn[type] = function (fn) {
            return this.on(type, fn);
        };
    });
    jQuery.expr.filters.animated = function (elem) {
        return jQuery.grep(jQuery.timers, function (fn) {
            return elem === fn.elem;
        }).length;
    };
    var docElem = window.document.documentElement;
    function getWindow(elem) {
        return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }
    jQuery.offset = {
        setOffset: function (elem, options, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery.css(elem, 'position'), curElem = jQuery(elem), props = {};
            if (position === 'static') {
                elem.style.position = 'relative';
            }
            curOffset = curElem.offset();
            curCSSTop = jQuery.css(elem, 'top');
            curCSSLeft = jQuery.css(elem, 'left');
            calculatePosition = (position === 'absolute' || position === 'fixed') && (curCSSTop + curCSSLeft).indexOf('auto') > -1;
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;
            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }
            if (jQuery.isFunction(options)) {
                options = options.call(elem, i, curOffset);
            }
            if (options.top != null) {
                props.top = options.top - curOffset.top + curTop;
            }
            if (options.left != null) {
                props.left = options.left - curOffset.left + curLeft;
            }
            if ('using' in options) {
                options.using.call(elem, props);
            } else {
                curElem.css(props);
            }
        }
    };
    jQuery.fn.extend({
        offset: function (options) {
            if (arguments.length) {
                return options === undefined ? this : this.each(function (i) {
                    jQuery.offset.setOffset(this, options, i);
                });
            }
            var docElem, win, elem = this[0], box = {
                    top: 0,
                    left: 0
                }, doc = elem && elem.ownerDocument;
            if (!doc) {
                return;
            }
            docElem = doc.documentElement;
            if (!jQuery.contains(docElem, elem)) {
                return box;
            }
            if (typeof elem.getBoundingClientRect !== strundefined) {
                box = elem.getBoundingClientRect();
            }
            win = getWindow(doc);
            return {
                top: box.top + win.pageYOffset - docElem.clientTop,
                left: box.left + win.pageXOffset - docElem.clientLeft
            };
        },
        position: function () {
            if (!this[0]) {
                return;
            }
            var offsetParent, offset, elem = this[0], parentOffset = {
                    top: 0,
                    left: 0
                };
            if (jQuery.css(elem, 'position') === 'fixed') {
                offset = elem.getBoundingClientRect();
            } else {
                offsetParent = this.offsetParent();
                offset = this.offset();
                if (!jQuery.nodeName(offsetParent[0], 'html')) {
                    parentOffset = offsetParent.offset();
                }
                parentOffset.top += jQuery.css(offsetParent[0], 'borderTopWidth', true);
                parentOffset.left += jQuery.css(offsetParent[0], 'borderLeftWidth', true);
            }
            return {
                top: offset.top - parentOffset.top - jQuery.css(elem, 'marginTop', true),
                left: offset.left - parentOffset.left - jQuery.css(elem, 'marginLeft', true)
            };
        },
        offsetParent: function () {
            return this.map(function () {
                var offsetParent = this.offsetParent || docElem;
                while (offsetParent && (!jQuery.nodeName(offsetParent, 'html') && jQuery.css(offsetParent, 'position') === 'static')) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || docElem;
            });
        }
    });
    jQuery.each({
        scrollLeft: 'pageXOffset',
        scrollTop: 'pageYOffset'
    }, function (method, prop) {
        var top = 'pageYOffset' === prop;
        jQuery.fn[method] = function (val) {
            return access(this, function (elem, method, val) {
                var win = getWindow(elem);
                if (val === undefined) {
                    return win ? win[prop] : elem[method];
                }
                if (win) {
                    win.scrollTo(!top ? val : window.pageXOffset, top ? val : window.pageYOffset);
                } else {
                    elem[method] = val;
                }
            }, method, val, arguments.length, null);
        };
    });
    jQuery.each([
        'top',
        'left'
    ], function (i, prop) {
        jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function (elem, computed) {
            if (computed) {
                computed = curCSS(elem, prop);
                return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + 'px' : computed;
            }
        });
    });
    jQuery.each({
        Height: 'height',
        Width: 'width'
    }, function (name, type) {
        jQuery.each({
            padding: 'inner' + name,
            content: type,
            '': 'outer' + name
        }, function (defaultExtra, funcName) {
            jQuery.fn[funcName] = function (margin, value) {
                var chainable = arguments.length && (defaultExtra || typeof margin !== 'boolean'), extra = defaultExtra || (margin === true || value === true ? 'margin' : 'border');
                return access(this, function (elem, type, value) {
                    var doc;
                    if (jQuery.isWindow(elem)) {
                        return elem.document.documentElement['client' + name];
                    }
                    if (elem.nodeType === 9) {
                        doc = elem.documentElement;
                        return Math.max(elem.body['scroll' + name], doc['scroll' + name], elem.body['offset' + name], doc['offset' + name], doc['client' + name]);
                    }
                    return value === undefined ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra);
                }, type, chainable ? margin : undefined, chainable, null);
            };
        });
    });
    jQuery.fn.size = function () {
        return this.length;
    };
    jQuery.fn.andSelf = jQuery.fn.addBack;
    if (typeof define === 'function' && define.amd) {
        define('jquery', [], function () {
            return jQuery;
        });
    }
    var _jQuery = window.jQuery, _$ = window.$;
    jQuery.noConflict = function (deep) {
        if (window.$ === jQuery) {
            window.$ = _$;
        }
        if (deep && window.jQuery === jQuery) {
            window.jQuery = _jQuery;
        }
        return jQuery;
    };
    if (typeof noGlobal === strundefined) {
        window.jQuery = window.$ = jQuery;
    }
    return jQuery;
}));
(function (factory) {
    var root = typeof self == 'object' && self.self == self && self || typeof global == 'object' && global.global == global && global;
    if (typeof define === 'function' && define.amd) {
        define('backbone', [
            'underscore',
            'jquery',
            'exports'
        ], function (_, $, exports) {
            root.Backbone = factory(root, exports, _, $);
        });
    } else if (typeof exports !== 'undefined') {
        var _ = require('underscore'), $;
        try {
            $ = require('jquery');
        } catch (e) {
        }
        factory(root, exports, _, $);
    } else {
        root.Backbone = factory(root, {}, root._, root.jQuery || root.Zepto || root.ender || root.$);
    }
}(function (root, Backbone, _, $) {
    var previousBackbone = root.Backbone;
    var slice = [].slice;
    Backbone.VERSION = '1.2.1';
    Backbone.$ = $;
    Backbone.noConflict = function () {
        root.Backbone = previousBackbone;
        return this;
    };
    Backbone.emulateHTTP = false;
    Backbone.emulateJSON = false;
    var addMethod = function (length, method, attribute) {
        switch (length) {
        case 1:
            return function () {
                return _[method](this[attribute]);
            };
        case 2:
            return function (value) {
                return _[method](this[attribute], value);
            };
        case 3:
            return function (iteratee, context) {
                return _[method](this[attribute], iteratee, context);
            };
        case 4:
            return function (iteratee, defaultVal, context) {
                return _[method](this[attribute], iteratee, defaultVal, context);
            };
        default:
            return function () {
                var args = slice.call(arguments);
                args.unshift(this[attribute]);
                return _[method].apply(_, args);
            };
        }
    };
    var addUnderscoreMethods = function (Class, methods, attribute) {
        _.each(methods, function (length, method) {
            if (_[method])
                Class.prototype[method] = addMethod(length, method, attribute);
        });
    };
    var Events = Backbone.Events = {};
    var eventSplitter = /\s+/;
    var eventsApi = function (iteratee, memo, name, callback, opts) {
        var i = 0, names;
        if (name && typeof name === 'object') {
            if (callback !== void 0 && 'context' in opts && opts.context === void 0)
                opts.context = callback;
            for (names = _.keys(name); i < names.length; i++) {
                memo = iteratee(memo, names[i], name[names[i]], opts);
            }
        } else if (name && eventSplitter.test(name)) {
            for (names = name.split(eventSplitter); i < names.length; i++) {
                memo = iteratee(memo, names[i], callback, opts);
            }
        } else {
            memo = iteratee(memo, name, callback, opts);
        }
        return memo;
    };
    Events.on = function (name, callback, context) {
        return internalOn(this, name, callback, context);
    };
    var internalOn = function (obj, name, callback, context, listening) {
        obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
            context: context,
            ctx: obj,
            listening: listening
        });
        if (listening) {
            var listeners = obj._listeners || (obj._listeners = {});
            listeners[listening.id] = listening;
        }
        return obj;
    };
    Events.listenTo = function (obj, name, callback) {
        if (!obj)
            return this;
        var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var listening = listeningTo[id];
        if (!listening) {
            var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
            listening = listeningTo[id] = {
                obj: obj,
                objId: id,
                id: thisId,
                listeningTo: listeningTo,
                count: 0
            };
        }
        internalOn(obj, name, callback, this, listening);
        return this;
    };
    var onApi = function (events, name, callback, options) {
        if (callback) {
            var handlers = events[name] || (events[name] = []);
            var context = options.context, ctx = options.ctx, listening = options.listening;
            if (listening)
                listening.count++;
            handlers.push({
                callback: callback,
                context: context,
                ctx: context || ctx,
                listening: listening
            });
        }
        return events;
    };
    Events.off = function (name, callback, context) {
        if (!this._events)
            return this;
        this._events = eventsApi(offApi, this._events, name, callback, {
            context: context,
            listeners: this._listeners
        });
        return this;
    };
    Events.stopListening = function (obj, name, callback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo)
            return this;
        var ids = obj ? [obj._listenId] : _.keys(listeningTo);
        for (var i = 0; i < ids.length; i++) {
            var listening = listeningTo[ids[i]];
            if (!listening)
                break;
            listening.obj.off(name, callback, this);
        }
        if (_.isEmpty(listeningTo))
            this._listeningTo = void 0;
        return this;
    };
    var offApi = function (events, name, callback, options) {
        if (!events)
            return;
        var i = 0, listening;
        var context = options.context, listeners = options.listeners;
        if (!name && !callback && !context) {
            var ids = _.keys(listeners);
            for (; i < ids.length; i++) {
                listening = listeners[ids[i]];
                delete listeners[listening.id];
                delete listening.listeningTo[listening.objId];
            }
            return;
        }
        var names = name ? [name] : _.keys(events);
        for (; i < names.length; i++) {
            name = names[i];
            var handlers = events[name];
            if (!handlers)
                break;
            var remaining = [];
            for (var j = 0; j < handlers.length; j++) {
                var handler = handlers[j];
                if (callback && callback !== handler.callback && callback !== handler.callback._callback || context && context !== handler.context) {
                    remaining.push(handler);
                } else {
                    listening = handler.listening;
                    if (listening && --listening.count === 0) {
                        delete listeners[listening.id];
                        delete listening.listeningTo[listening.objId];
                    }
                }
            }
            if (remaining.length) {
                events[name] = remaining;
            } else {
                delete events[name];
            }
        }
        if (_.size(events))
            return events;
    };
    Events.once = function (name, callback, context) {
        var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
        return this.on(events, void 0, context);
    };
    Events.listenToOnce = function (obj, name, callback) {
        var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
        return this.listenTo(obj, events);
    };
    var onceMap = function (map, name, callback, offer) {
        if (callback) {
            var once = map[name] = _.once(function () {
                offer(name, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
        }
        return map;
    };
    Events.trigger = function (name) {
        if (!this._events)
            return this;
        var length = Math.max(0, arguments.length - 1);
        var args = Array(length);
        for (var i = 0; i < length; i++)
            args[i] = arguments[i + 1];
        eventsApi(triggerApi, this._events, name, void 0, args);
        return this;
    };
    var triggerApi = function (objEvents, name, cb, args) {
        if (objEvents) {
            var events = objEvents[name];
            var allEvents = objEvents.all;
            if (events && allEvents)
                allEvents = allEvents.slice();
            if (events)
                triggerEvents(events, args);
            if (allEvents)
                triggerEvents(allEvents, [name].concat(args));
        }
        return objEvents;
    };
    var triggerEvents = function (events, args) {
        var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
        switch (args.length) {
        case 0:
            while (++i < l)
                (ev = events[i]).callback.call(ev.ctx);
            return;
        case 1:
            while (++i < l)
                (ev = events[i]).callback.call(ev.ctx, a1);
            return;
        case 2:
            while (++i < l)
                (ev = events[i]).callback.call(ev.ctx, a1, a2);
            return;
        case 3:
            while (++i < l)
                (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
            return;
        default:
            while (++i < l)
                (ev = events[i]).callback.apply(ev.ctx, args);
            return;
        }
    };
    Events.bind = Events.on;
    Events.unbind = Events.off;
    _.extend(Backbone, Events);
    var Model = Backbone.Model = function (attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId(this.cidPrefix);
        this.attributes = {};
        if (options.collection)
            this.collection = options.collection;
        if (options.parse)
            attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};
        this.initialize.apply(this, arguments);
    };
    _.extend(Model.prototype, Events, {
        changed: null,
        validationError: null,
        idAttribute: 'id',
        cidPrefix: 'c',
        initialize: function () {
        },
        toJSON: function (options) {
            return _.clone(this.attributes);
        },
        sync: function () {
            return Backbone.sync.apply(this, arguments);
        },
        get: function (attr) {
            return this.attributes[attr];
        },
        escape: function (attr) {
            return _.escape(this.get(attr));
        },
        has: function (attr) {
            return this.get(attr) != null;
        },
        matches: function (attrs) {
            return !!_.iteratee(attrs, this)(this.attributes);
        },
        set: function (key, val, options) {
            if (key == null)
                return this;
            var attrs;
            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }
            options || (options = {});
            if (!this._validate(attrs, options))
                return false;
            var unset = options.unset;
            var silent = options.silent;
            var changes = [];
            var changing = this._changing;
            this._changing = true;
            if (!changing) {
                this._previousAttributes = _.clone(this.attributes);
                this.changed = {};
            }
            var current = this.attributes;
            var changed = this.changed;
            var prev = this._previousAttributes;
            if (this.idAttribute in attrs)
                this.id = attrs[this.idAttribute];
            for (var attr in attrs) {
                val = attrs[attr];
                if (!_.isEqual(current[attr], val))
                    changes.push(attr);
                if (!_.isEqual(prev[attr], val)) {
                    changed[attr] = val;
                } else {
                    delete changed[attr];
                }
                unset ? delete current[attr] : current[attr] = val;
            }
            if (!silent) {
                if (changes.length)
                    this._pending = options;
                for (var i = 0; i < changes.length; i++) {
                    this.trigger('change:' + changes[i], this, current[changes[i]], options);
                }
            }
            if (changing)
                return this;
            if (!silent) {
                while (this._pending) {
                    options = this._pending;
                    this._pending = false;
                    this.trigger('change', this, options);
                }
            }
            this._pending = false;
            this._changing = false;
            return this;
        },
        unset: function (attr, options) {
            return this.set(attr, void 0, _.extend({}, options, { unset: true }));
        },
        clear: function (options) {
            var attrs = {};
            for (var key in this.attributes)
                attrs[key] = void 0;
            return this.set(attrs, _.extend({}, options, { unset: true }));
        },
        hasChanged: function (attr) {
            if (attr == null)
                return !_.isEmpty(this.changed);
            return _.has(this.changed, attr);
        },
        changedAttributes: function (diff) {
            if (!diff)
                return this.hasChanged() ? _.clone(this.changed) : false;
            var old = this._changing ? this._previousAttributes : this.attributes;
            var changed = {};
            for (var attr in diff) {
                var val = diff[attr];
                if (_.isEqual(old[attr], val))
                    continue;
                changed[attr] = val;
            }
            return _.size(changed) ? changed : false;
        },
        previous: function (attr) {
            if (attr == null || !this._previousAttributes)
                return null;
            return this._previousAttributes[attr];
        },
        previousAttributes: function () {
            return _.clone(this._previousAttributes);
        },
        fetch: function (options) {
            options = _.extend({ parse: true }, options);
            var model = this;
            var success = options.success;
            options.success = function (resp) {
                var serverAttrs = options.parse ? model.parse(resp, options) : resp;
                if (!model.set(serverAttrs, options))
                    return false;
                if (success)
                    success.call(options.context, model, resp, options);
                model.trigger('sync', model, resp, options);
            };
            wrapError(this, options);
            return this.sync('read', this, options);
        },
        save: function (key, val, options) {
            var attrs;
            if (key == null || typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }
            options = _.extend({
                validate: true,
                parse: true
            }, options);
            var wait = options.wait;
            if (attrs && !wait) {
                if (!this.set(attrs, options))
                    return false;
            } else {
                if (!this._validate(attrs, options))
                    return false;
            }
            var model = this;
            var success = options.success;
            var attributes = this.attributes;
            options.success = function (resp) {
                model.attributes = attributes;
                var serverAttrs = options.parse ? model.parse(resp, options) : resp;
                if (wait)
                    serverAttrs = _.extend({}, attrs, serverAttrs);
                if (serverAttrs && !model.set(serverAttrs, options))
                    return false;
                if (success)
                    success.call(options.context, model, resp, options);
                model.trigger('sync', model, resp, options);
            };
            wrapError(this, options);
            if (attrs && wait)
                this.attributes = _.extend({}, attributes, attrs);
            var method = this.isNew() ? 'create' : options.patch ? 'patch' : 'update';
            if (method === 'patch' && !options.attrs)
                options.attrs = attrs;
            var xhr = this.sync(method, this, options);
            this.attributes = attributes;
            return xhr;
        },
        destroy: function (options) {
            options = options ? _.clone(options) : {};
            var model = this;
            var success = options.success;
            var wait = options.wait;
            var destroy = function () {
                model.stopListening();
                model.trigger('destroy', model, model.collection, options);
            };
            options.success = function (resp) {
                if (wait)
                    destroy();
                if (success)
                    success.call(options.context, model, resp, options);
                if (!model.isNew())
                    model.trigger('sync', model, resp, options);
            };
            var xhr = false;
            if (this.isNew()) {
                _.defer(options.success);
            } else {
                wrapError(this, options);
                xhr = this.sync('delete', this, options);
            }
            if (!wait)
                destroy();
            return xhr;
        },
        url: function () {
            var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
            if (this.isNew())
                return base;
            var id = this.get(this.idAttribute);
            return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
        },
        parse: function (resp, options) {
            return resp;
        },
        clone: function () {
            return new this.constructor(this.attributes);
        },
        isNew: function () {
            return !this.has(this.idAttribute);
        },
        isValid: function (options) {
            return this._validate({}, _.defaults({ validate: true }, options));
        },
        _validate: function (attrs, options) {
            if (!options.validate || !this.validate)
                return true;
            attrs = _.extend({}, this.attributes, attrs);
            var error = this.validationError = this.validate(attrs, options) || null;
            if (!error)
                return true;
            this.trigger('invalid', this, error, _.extend(options, { validationError: error }));
            return false;
        }
    });
    var modelMethods = {
        keys: 1,
        values: 1,
        pairs: 1,
        invert: 1,
        pick: 0,
        omit: 0,
        chain: 1,
        isEmpty: 1
    };
    addUnderscoreMethods(Model, modelMethods, 'attributes');
    var Collection = Backbone.Collection = function (models, options) {
        options || (options = {});
        if (options.model)
            this.model = options.model;
        if (options.comparator !== void 0)
            this.comparator = options.comparator;
        this._reset();
        this.initialize.apply(this, arguments);
        if (models)
            this.reset(models, _.extend({ silent: true }, options));
    };
    var setOptions = {
        add: true,
        remove: true,
        merge: true
    };
    var addOptions = {
        add: true,
        remove: false
    };
    _.extend(Collection.prototype, Events, {
        model: Model,
        initialize: function () {
        },
        toJSON: function (options) {
            return this.map(function (model) {
                return model.toJSON(options);
            });
        },
        sync: function () {
            return Backbone.sync.apply(this, arguments);
        },
        add: function (models, options) {
            return this.set(models, _.extend({ merge: false }, options, addOptions));
        },
        remove: function (models, options) {
            options = _.extend({}, options);
            var singular = !_.isArray(models);
            models = singular ? [models] : _.clone(models);
            var removed = this._removeModels(models, options);
            if (!options.silent && removed)
                this.trigger('update', this, options);
            return singular ? removed[0] : removed;
        },
        set: function (models, options) {
            options = _.defaults({}, options, setOptions);
            if (options.parse && !this._isModel(models))
                models = this.parse(models, options);
            var singular = !_.isArray(models);
            models = singular ? models ? [models] : [] : models.slice();
            var id, model, attrs, existing, sort;
            var at = options.at;
            if (at != null)
                at = +at;
            if (at < 0)
                at += this.length + 1;
            var sortable = this.comparator && at == null && options.sort !== false;
            var sortAttr = _.isString(this.comparator) ? this.comparator : null;
            var toAdd = [], toRemove = [], modelMap = {};
            var add = options.add, merge = options.merge, remove = options.remove;
            var order = !sortable && add && remove ? [] : false;
            var orderChanged = false;
            for (var i = 0; i < models.length; i++) {
                attrs = models[i];
                if (existing = this.get(attrs)) {
                    if (remove)
                        modelMap[existing.cid] = true;
                    if (merge && attrs !== existing) {
                        attrs = this._isModel(attrs) ? attrs.attributes : attrs;
                        if (options.parse)
                            attrs = existing.parse(attrs, options);
                        existing.set(attrs, options);
                        if (sortable && !sort && existing.hasChanged(sortAttr))
                            sort = true;
                    }
                    models[i] = existing;
                } else if (add) {
                    model = models[i] = this._prepareModel(attrs, options);
                    if (!model)
                        continue;
                    toAdd.push(model);
                    this._addReference(model, options);
                }
                model = existing || model;
                if (!model)
                    continue;
                id = this.modelId(model.attributes);
                if (order && (model.isNew() || !modelMap[id])) {
                    order.push(model);
                    orderChanged = orderChanged || !this.models[i] || model.cid !== this.models[i].cid;
                }
                modelMap[id] = true;
            }
            if (remove) {
                for (var i = 0; i < this.length; i++) {
                    if (!modelMap[(model = this.models[i]).cid])
                        toRemove.push(model);
                }
                if (toRemove.length)
                    this._removeModels(toRemove, options);
            }
            if (toAdd.length || orderChanged) {
                if (sortable)
                    sort = true;
                this.length += toAdd.length;
                if (at != null) {
                    for (var i = 0; i < toAdd.length; i++) {
                        this.models.splice(at + i, 0, toAdd[i]);
                    }
                } else {
                    if (order)
                        this.models.length = 0;
                    var orderedModels = order || toAdd;
                    for (var i = 0; i < orderedModels.length; i++) {
                        this.models.push(orderedModels[i]);
                    }
                }
            }
            if (sort)
                this.sort({ silent: true });
            if (!options.silent) {
                var addOpts = at != null ? _.clone(options) : options;
                for (var i = 0; i < toAdd.length; i++) {
                    if (at != null)
                        addOpts.index = at + i;
                    (model = toAdd[i]).trigger('add', model, this, addOpts);
                }
                if (sort || orderChanged)
                    this.trigger('sort', this, options);
                if (toAdd.length || toRemove.length)
                    this.trigger('update', this, options);
            }
            return singular ? models[0] : models;
        },
        reset: function (models, options) {
            options = options ? _.clone(options) : {};
            for (var i = 0; i < this.models.length; i++) {
                this._removeReference(this.models[i], options);
            }
            options.previousModels = this.models;
            this._reset();
            models = this.add(models, _.extend({ silent: true }, options));
            if (!options.silent)
                this.trigger('reset', this, options);
            return models;
        },
        push: function (model, options) {
            return this.add(model, _.extend({ at: this.length }, options));
        },
        pop: function (options) {
            var model = this.at(this.length - 1);
            return this.remove(model, options);
        },
        unshift: function (model, options) {
            return this.add(model, _.extend({ at: 0 }, options));
        },
        shift: function (options) {
            var model = this.at(0);
            return this.remove(model, options);
        },
        slice: function () {
            return slice.apply(this.models, arguments);
        },
        get: function (obj) {
            if (obj == null)
                return void 0;
            var id = this.modelId(this._isModel(obj) ? obj.attributes : obj);
            return this._byId[obj] || this._byId[id] || this._byId[obj.cid];
        },
        at: function (index) {
            if (index < 0)
                index += this.length;
            return this.models[index];
        },
        where: function (attrs, first) {
            var matches = _.matches(attrs);
            return this[first ? 'find' : 'filter'](function (model) {
                return matches(model.attributes);
            });
        },
        findWhere: function (attrs) {
            return this.where(attrs, true);
        },
        sort: function (options) {
            if (!this.comparator)
                throw new Error('Cannot sort a set without a comparator');
            options || (options = {});
            if (_.isString(this.comparator) || this.comparator.length === 1) {
                this.models = this.sortBy(this.comparator, this);
            } else {
                this.models.sort(_.bind(this.comparator, this));
            }
            if (!options.silent)
                this.trigger('sort', this, options);
            return this;
        },
        pluck: function (attr) {
            return _.invoke(this.models, 'get', attr);
        },
        fetch: function (options) {
            options = _.extend({ parse: true }, options);
            var success = options.success;
            var collection = this;
            options.success = function (resp) {
                var method = options.reset ? 'reset' : 'set';
                collection[method](resp, options);
                if (success)
                    success.call(options.context, collection, resp, options);
                collection.trigger('sync', collection, resp, options);
            };
            wrapError(this, options);
            return this.sync('read', this, options);
        },
        create: function (model, options) {
            options = options ? _.clone(options) : {};
            var wait = options.wait;
            model = this._prepareModel(model, options);
            if (!model)
                return false;
            if (!wait)
                this.add(model, options);
            var collection = this;
            var success = options.success;
            options.success = function (model, resp, callbackOpts) {
                if (wait)
                    collection.add(model, callbackOpts);
                if (success)
                    success.call(callbackOpts.context, model, resp, callbackOpts);
            };
            model.save(null, options);
            return model;
        },
        parse: function (resp, options) {
            return resp;
        },
        clone: function () {
            return new this.constructor(this.models, {
                model: this.model,
                comparator: this.comparator
            });
        },
        modelId: function (attrs) {
            return attrs[this.model.prototype.idAttribute || 'id'];
        },
        _reset: function () {
            this.length = 0;
            this.models = [];
            this._byId = {};
        },
        _prepareModel: function (attrs, options) {
            if (this._isModel(attrs)) {
                if (!attrs.collection)
                    attrs.collection = this;
                return attrs;
            }
            options = options ? _.clone(options) : {};
            options.collection = this;
            var model = new this.model(attrs, options);
            if (!model.validationError)
                return model;
            this.trigger('invalid', this, model.validationError, options);
            return false;
        },
        _removeModels: function (models, options) {
            var removed = [];
            for (var i = 0; i < models.length; i++) {
                var model = this.get(models[i]);
                if (!model)
                    continue;
                var index = this.indexOf(model);
                this.models.splice(index, 1);
                this.length--;
                if (!options.silent) {
                    options.index = index;
                    model.trigger('remove', model, this, options);
                }
                removed.push(model);
                this._removeReference(model, options);
            }
            return removed.length ? removed : false;
        },
        _isModel: function (model) {
            return model instanceof Model;
        },
        _addReference: function (model, options) {
            this._byId[model.cid] = model;
            var id = this.modelId(model.attributes);
            if (id != null)
                this._byId[id] = model;
            model.on('all', this._onModelEvent, this);
        },
        _removeReference: function (model, options) {
            delete this._byId[model.cid];
            var id = this.modelId(model.attributes);
            if (id != null)
                delete this._byId[id];
            if (this === model.collection)
                delete model.collection;
            model.off('all', this._onModelEvent, this);
        },
        _onModelEvent: function (event, model, collection, options) {
            if ((event === 'add' || event === 'remove') && collection !== this)
                return;
            if (event === 'destroy')
                this.remove(model, options);
            if (event === 'change') {
                var prevId = this.modelId(model.previousAttributes());
                var id = this.modelId(model.attributes);
                if (prevId !== id) {
                    if (prevId != null)
                        delete this._byId[prevId];
                    if (id != null)
                        this._byId[id] = model;
                }
            }
            this.trigger.apply(this, arguments);
        }
    });
    var collectionMethods = {
        forEach: 3,
        each: 3,
        map: 3,
        collect: 3,
        reduce: 4,
        foldl: 4,
        inject: 4,
        reduceRight: 4,
        foldr: 4,
        find: 3,
        detect: 3,
        filter: 3,
        select: 3,
        reject: 3,
        every: 3,
        all: 3,
        some: 3,
        any: 3,
        include: 2,
        contains: 2,
        invoke: 0,
        max: 3,
        min: 3,
        toArray: 1,
        size: 1,
        first: 3,
        head: 3,
        take: 3,
        initial: 3,
        rest: 3,
        tail: 3,
        drop: 3,
        last: 3,
        without: 0,
        difference: 0,
        indexOf: 3,
        shuffle: 1,
        lastIndexOf: 3,
        isEmpty: 1,
        chain: 1,
        sample: 3,
        partition: 3
    };
    addUnderscoreMethods(Collection, collectionMethods, 'models');
    var attributeMethods = [
        'groupBy',
        'countBy',
        'sortBy',
        'indexBy'
    ];
    _.each(attributeMethods, function (method) {
        if (!_[method])
            return;
        Collection.prototype[method] = function (value, context) {
            var iterator = _.isFunction(value) ? value : function (model) {
                return model.get(value);
            };
            return _[method](this.models, iterator, context);
        };
    });
    var View = Backbone.View = function (options) {
        this.cid = _.uniqueId('view');
        _.extend(this, _.pick(options, viewOptions));
        this._ensureElement();
        this.initialize.apply(this, arguments);
    };
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
    var viewOptions = [
        'model',
        'collection',
        'el',
        'id',
        'attributes',
        'className',
        'tagName',
        'events'
    ];
    _.extend(View.prototype, Events, {
        tagName: 'div',
        $: function (selector) {
            return this.$el.find(selector);
        },
        initialize: function () {
        },
        render: function () {
            return this;
        },
        remove: function () {
            this._removeElement();
            this.stopListening();
            return this;
        },
        _removeElement: function () {
            this.$el.remove();
        },
        setElement: function (element) {
            this.undelegateEvents();
            this._setElement(element);
            this.delegateEvents();
            return this;
        },
        _setElement: function (el) {
            this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
            this.el = this.$el[0];
        },
        delegateEvents: function (events) {
            events || (events = _.result(this, 'events'));
            if (!events)
                return this;
            this.undelegateEvents();
            for (var key in events) {
                var method = events[key];
                if (!_.isFunction(method))
                    method = this[method];
                if (!method)
                    continue;
                var match = key.match(delegateEventSplitter);
                this.delegate(match[1], match[2], _.bind(method, this));
            }
            return this;
        },
        delegate: function (eventName, selector, listener) {
            this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
            return this;
        },
        undelegateEvents: function () {
            if (this.$el)
                this.$el.off('.delegateEvents' + this.cid);
            return this;
        },
        undelegate: function (eventName, selector, listener) {
            this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
            return this;
        },
        _createElement: function (tagName) {
            return document.createElement(tagName);
        },
        _ensureElement: function () {
            if (!this.el) {
                var attrs = _.extend({}, _.result(this, 'attributes'));
                if (this.id)
                    attrs.id = _.result(this, 'id');
                if (this.className)
                    attrs['class'] = _.result(this, 'className');
                this.setElement(this._createElement(_.result(this, 'tagName')));
                this._setAttributes(attrs);
            } else {
                this.setElement(_.result(this, 'el'));
            }
        },
        _setAttributes: function (attributes) {
            this.$el.attr(attributes);
        }
    });
    Backbone.sync = function (method, model, options) {
        var type = methodMap[method];
        _.defaults(options || (options = {}), {
            emulateHTTP: Backbone.emulateHTTP,
            emulateJSON: Backbone.emulateJSON
        });
        var params = {
            type: type,
            dataType: 'json'
        };
        if (!options.url) {
            params.url = _.result(model, 'url') || urlError();
        }
        if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(options.attrs || model.toJSON(options));
        }
        if (options.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.data = params.data ? { model: params.data } : {};
        }
        if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
            params.type = 'POST';
            if (options.emulateJSON)
                params.data._method = type;
            var beforeSend = options.beforeSend;
            options.beforeSend = function (xhr) {
                xhr.setRequestHeader('X-HTTP-Method-Override', type);
                if (beforeSend)
                    return beforeSend.apply(this, arguments);
            };
        }
        if (params.type !== 'GET' && !options.emulateJSON) {
            params.processData = false;
        }
        var error = options.error;
        options.error = function (xhr, textStatus, errorThrown) {
            options.textStatus = textStatus;
            options.errorThrown = errorThrown;
            if (error)
                error.call(options.context, xhr, textStatus, errorThrown);
        };
        var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
        model.trigger('request', model, xhr, options);
        return xhr;
    };
    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'patch': 'PATCH',
        'delete': 'DELETE',
        'read': 'GET'
    };
    Backbone.ajax = function () {
        return Backbone.$.ajax.apply(Backbone.$, arguments);
    };
    var Router = Backbone.Router = function (options) {
        options || (options = {});
        if (options.routes)
            this.routes = options.routes;
        this._bindRoutes();
        this.initialize.apply(this, arguments);
    };
    var optionalParam = /\((.*?)\)/g;
    var namedParam = /(\(\?)?:\w+/g;
    var splatParam = /\*\w+/g;
    var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    _.extend(Router.prototype, Events, {
        initialize: function () {
        },
        route: function (route, name, callback) {
            if (!_.isRegExp(route))
                route = this._routeToRegExp(route);
            if (_.isFunction(name)) {
                callback = name;
                name = '';
            }
            if (!callback)
                callback = this[name];
            var router = this;
            Backbone.history.route(route, function (fragment) {
                var args = router._extractParameters(route, fragment);
                if (router.execute(callback, args, name) !== false) {
                    router.trigger.apply(router, ['route:' + name].concat(args));
                    router.trigger('route', name, args);
                    Backbone.history.trigger('route', router, name, args);
                }
            });
            return this;
        },
        execute: function (callback, args, name) {
            if (callback)
                callback.apply(this, args);
        },
        navigate: function (fragment, options) {
            Backbone.history.navigate(fragment, options);
            return this;
        },
        _bindRoutes: function () {
            if (!this.routes)
                return;
            this.routes = _.result(this, 'routes');
            var route, routes = _.keys(this.routes);
            while ((route = routes.pop()) != null) {
                this.route(route, this.routes[route]);
            }
        },
        _routeToRegExp: function (route) {
            route = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function (match, optional) {
                return optional ? match : '([^/?]+)';
            }).replace(splatParam, '([^?]*?)');
            return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
        },
        _extractParameters: function (route, fragment) {
            var params = route.exec(fragment).slice(1);
            return _.map(params, function (param, i) {
                if (i === params.length - 1)
                    return param || null;
                return param ? decodeURIComponent(param) : null;
            });
        }
    });
    var History = Backbone.History = function () {
        this.handlers = [];
        _.bindAll(this, 'checkUrl');
        if (typeof window !== 'undefined') {
            this.location = window.location;
            this.history = window.history;
        }
    };
    var routeStripper = /^[#\/]|\s+$/g;
    var rootStripper = /^\/+|\/+$/g;
    var pathStripper = /#.*$/;
    History.started = false;
    _.extend(History.prototype, Events, {
        interval: 50,
        atRoot: function () {
            var path = this.location.pathname.replace(/[^\/]$/, '$&/');
            return path === this.root && !this.getSearch();
        },
        matchRoot: function () {
            var path = this.decodeFragment(this.location.pathname);
            var root = path.slice(0, this.root.length - 1) + '/';
            return root === this.root;
        },
        decodeFragment: function (fragment) {
            return decodeURI(fragment.replace(/%25/g, '%2525'));
        },
        getSearch: function () {
            var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
            return match ? match[0] : '';
        },
        getHash: function (window) {
            var match = (window || this).location.href.match(/#(.*)$/);
            return match ? match[1] : '';
        },
        getPath: function () {
            var path = this.decodeFragment(this.location.pathname + this.getSearch()).slice(this.root.length - 1);
            return path.charAt(0) === '/' ? path.slice(1) : path;
        },
        getFragment: function (fragment) {
            if (fragment == null) {
                if (this._usePushState || !this._wantsHashChange) {
                    fragment = this.getPath();
                } else {
                    fragment = this.getHash();
                }
            }
            return fragment.replace(routeStripper, '');
        },
        start: function (options) {
            if (History.started)
                throw new Error('Backbone.history has already been started');
            History.started = true;
            this.options = _.extend({ root: '/' }, this.options, options);
            this.root = this.options.root;
            this._wantsHashChange = this.options.hashChange !== false;
            this._hasHashChange = 'onhashchange' in window;
            this._useHashChange = this._wantsHashChange && this._hasHashChange;
            this._wantsPushState = !!this.options.pushState;
            this._hasPushState = !!(this.history && this.history.pushState);
            this._usePushState = this._wantsPushState && this._hasPushState;
            this.fragment = this.getFragment();
            this.root = ('/' + this.root + '/').replace(rootStripper, '/');
            if (this._wantsHashChange && this._wantsPushState) {
                if (!this._hasPushState && !this.atRoot()) {
                    var root = this.root.slice(0, -1) || '/';
                    this.location.replace(root + '#' + this.getPath());
                    return true;
                } else if (this._hasPushState && this.atRoot()) {
                    this.navigate(this.getHash(), { replace: true });
                }
            }
            if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
                this.iframe = document.createElement('iframe');
                this.iframe.src = 'javascript:0';
                this.iframe.style.display = 'none';
                this.iframe.tabIndex = -1;
                var body = document.body;
                var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
                iWindow.document.open();
                iWindow.document.close();
                iWindow.location.hash = '#' + this.fragment;
            }
            var addEventListener = window.addEventListener || function (eventName, listener) {
                return attachEvent('on' + eventName, listener);
            };
            if (this._usePushState) {
                addEventListener('popstate', this.checkUrl, false);
            } else if (this._useHashChange && !this.iframe) {
                addEventListener('hashchange', this.checkUrl, false);
            } else if (this._wantsHashChange) {
                this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
            }
            if (!this.options.silent)
                return this.loadUrl();
        },
        stop: function () {
            var removeEventListener = window.removeEventListener || function (eventName, listener) {
                return detachEvent('on' + eventName, listener);
            };
            if (this._usePushState) {
                removeEventListener('popstate', this.checkUrl, false);
            } else if (this._useHashChange && !this.iframe) {
                removeEventListener('hashchange', this.checkUrl, false);
            }
            if (this.iframe) {
                document.body.removeChild(this.iframe);
                this.iframe = null;
            }
            if (this._checkUrlInterval)
                clearInterval(this._checkUrlInterval);
            History.started = false;
        },
        route: function (route, callback) {
            this.handlers.unshift({
                route: route,
                callback: callback
            });
        },
        checkUrl: function (e) {
            var current = this.getFragment();
            if (current === this.fragment && this.iframe) {
                current = this.getHash(this.iframe.contentWindow);
            }
            if (current === this.fragment)
                return false;
            if (this.iframe)
                this.navigate(current);
            this.loadUrl();
        },
        loadUrl: function (fragment) {
            if (!this.matchRoot())
                return false;
            fragment = this.fragment = this.getFragment(fragment);
            return _.any(this.handlers, function (handler) {
                if (handler.route.test(fragment)) {
                    handler.callback(fragment);
                    return true;
                }
            });
        },
        navigate: function (fragment, options) {
            if (!History.started)
                return false;
            if (!options || options === true)
                options = { trigger: !!options };
            fragment = this.getFragment(fragment || '');
            var root = this.root;
            if (fragment === '' || fragment.charAt(0) === '?') {
                root = root.slice(0, -1) || '/';
            }
            var url = root + fragment;
            fragment = this.decodeFragment(fragment.replace(pathStripper, ''));
            if (this.fragment === fragment)
                return;
            this.fragment = fragment;
            if (this._usePushState) {
                this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);
            } else if (this._wantsHashChange) {
                this._updateHash(this.location, fragment, options.replace);
                if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
                    var iWindow = this.iframe.contentWindow;
                    if (!options.replace) {
                        iWindow.document.open();
                        iWindow.document.close();
                    }
                    this._updateHash(iWindow.location, fragment, options.replace);
                }
            } else {
                return this.location.assign(url);
            }
            if (options.trigger)
                return this.loadUrl(fragment);
        },
        _updateHash: function (location, fragment, replace) {
            if (replace) {
                var href = location.href.replace(/(javascript:|#).*$/, '');
                location.replace(href + '#' + fragment);
            } else {
                location.hash = '#' + fragment;
            }
        }
    });
    Backbone.history = new History();
    var extend = function (protoProps, staticProps) {
        var parent = this;
        var child;
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                return parent.apply(this, arguments);
            };
        }
        _.extend(child, parent, staticProps);
        var Surrogate = function () {
            this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();
        if (protoProps)
            _.extend(child.prototype, protoProps);
        child.__super__ = parent.prototype;
        return child;
    };
    Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;
    var urlError = function () {
        throw new Error('A "url" property or function must be specified');
    };
    var wrapError = function (model, options) {
        var error = options.error;
        options.error = function (resp) {
            if (error)
                error.call(options.context, model, resp, options);
            model.trigger('error', model, resp, options);
        };
    };
    return Backbone;
}));
(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if (typeof define === 'function' && define.amd)
        define('handlebars', [], factory);
    else if (typeof exports === 'object')
        exports['Handlebars'] = factory();
    else
        root['Handlebars'] = factory();
}(this, function () {
    return function (modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId])
                return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                exports: {},
                id: moduleId,
                loaded: false
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.loaded = true;
            return module.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.p = '';
        return __webpack_require__(0);
    }([
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            var _runtime = __webpack_require__(1);
            var _runtime2 = _interopRequireWildcard(_runtime);
            var _AST = __webpack_require__(2);
            var _AST2 = _interopRequireWildcard(_AST);
            var _Parser$parse = __webpack_require__(3);
            var _Compiler$compile$precompile = __webpack_require__(4);
            var _JavaScriptCompiler = __webpack_require__(5);
            var _JavaScriptCompiler2 = _interopRequireWildcard(_JavaScriptCompiler);
            var _Visitor = __webpack_require__(6);
            var _Visitor2 = _interopRequireWildcard(_Visitor);
            var _noConflict = __webpack_require__(7);
            var _noConflict2 = _interopRequireWildcard(_noConflict);
            var _create = _runtime2['default'].create;
            function create() {
                var hb = _create();
                hb.compile = function (input, options) {
                    return _Compiler$compile$precompile.compile(input, options, hb);
                };
                hb.precompile = function (input, options) {
                    return _Compiler$compile$precompile.precompile(input, options, hb);
                };
                hb.AST = _AST2['default'];
                hb.Compiler = _Compiler$compile$precompile.Compiler;
                hb.JavaScriptCompiler = _JavaScriptCompiler2['default'];
                hb.Parser = _Parser$parse.parser;
                hb.parse = _Parser$parse.parse;
                return hb;
            }
            var inst = create();
            inst.create = create;
            _noConflict2['default'](inst);
            inst.Visitor = _Visitor2['default'];
            inst['default'] = inst;
            exports['default'] = inst;
            module.exports = exports['default'];
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            var _import = __webpack_require__(9);
            var base = _interopRequireWildcard(_import);
            var _SafeString = __webpack_require__(10);
            var _SafeString2 = _interopRequireWildcard(_SafeString);
            var _Exception = __webpack_require__(11);
            var _Exception2 = _interopRequireWildcard(_Exception);
            var _import2 = __webpack_require__(12);
            var Utils = _interopRequireWildcard(_import2);
            var _import3 = __webpack_require__(13);
            var runtime = _interopRequireWildcard(_import3);
            var _noConflict = __webpack_require__(7);
            var _noConflict2 = _interopRequireWildcard(_noConflict);
            function create() {
                var hb = new base.HandlebarsEnvironment();
                Utils.extend(hb, base);
                hb.SafeString = _SafeString2['default'];
                hb.Exception = _Exception2['default'];
                hb.Utils = Utils;
                hb.escapeExpression = Utils.escapeExpression;
                hb.VM = runtime;
                hb.template = function (spec) {
                    return runtime.template(spec, hb);
                };
                return hb;
            }
            var inst = create();
            inst.create = create;
            _noConflict2['default'](inst);
            inst['default'] = inst;
            exports['default'] = inst;
            module.exports = exports['default'];
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            exports.__esModule = true;
            var AST = {
                Program: function Program(statements, blockParams, strip, locInfo) {
                    this.loc = locInfo;
                    this.type = 'Program';
                    this.body = statements;
                    this.blockParams = blockParams;
                    this.strip = strip;
                },
                MustacheStatement: function MustacheStatement(path, params, hash, escaped, strip, locInfo) {
                    this.loc = locInfo;
                    this.type = 'MustacheStatement';
                    this.path = path;
                    this.params = params || [];
                    this.hash = hash;
                    this.escaped = escaped;
                    this.strip = strip;
                },
                BlockStatement: function BlockStatement(path, params, hash, program, inverse, openStrip, inverseStrip, closeStrip, locInfo) {
                    this.loc = locInfo;
                    this.type = 'BlockStatement';
                    this.path = path;
                    this.params = params || [];
                    this.hash = hash;
                    this.program = program;
                    this.inverse = inverse;
                    this.openStrip = openStrip;
                    this.inverseStrip = inverseStrip;
                    this.closeStrip = closeStrip;
                },
                PartialStatement: function PartialStatement(name, params, hash, strip, locInfo) {
                    this.loc = locInfo;
                    this.type = 'PartialStatement';
                    this.name = name;
                    this.params = params || [];
                    this.hash = hash;
                    this.indent = '';
                    this.strip = strip;
                },
                ContentStatement: function ContentStatement(string, locInfo) {
                    this.loc = locInfo;
                    this.type = 'ContentStatement';
                    this.original = this.value = string;
                },
                CommentStatement: function CommentStatement(comment, strip, locInfo) {
                    this.loc = locInfo;
                    this.type = 'CommentStatement';
                    this.value = comment;
                    this.strip = strip;
                },
                SubExpression: function SubExpression(path, params, hash, locInfo) {
                    this.loc = locInfo;
                    this.type = 'SubExpression';
                    this.path = path;
                    this.params = params || [];
                    this.hash = hash;
                },
                PathExpression: function PathExpression(data, depth, parts, original, locInfo) {
                    this.loc = locInfo;
                    this.type = 'PathExpression';
                    this.data = data;
                    this.original = original;
                    this.parts = parts;
                    this.depth = depth;
                },
                StringLiteral: function StringLiteral(string, locInfo) {
                    this.loc = locInfo;
                    this.type = 'StringLiteral';
                    this.original = this.value = string;
                },
                NumberLiteral: function NumberLiteral(number, locInfo) {
                    this.loc = locInfo;
                    this.type = 'NumberLiteral';
                    this.original = this.value = Number(number);
                },
                BooleanLiteral: function BooleanLiteral(bool, locInfo) {
                    this.loc = locInfo;
                    this.type = 'BooleanLiteral';
                    this.original = this.value = bool === 'true';
                },
                UndefinedLiteral: function UndefinedLiteral(locInfo) {
                    this.loc = locInfo;
                    this.type = 'UndefinedLiteral';
                    this.original = this.value = undefined;
                },
                NullLiteral: function NullLiteral(locInfo) {
                    this.loc = locInfo;
                    this.type = 'NullLiteral';
                    this.original = this.value = null;
                },
                Hash: function Hash(pairs, locInfo) {
                    this.loc = locInfo;
                    this.type = 'Hash';
                    this.pairs = pairs;
                },
                HashPair: function HashPair(key, value, locInfo) {
                    this.loc = locInfo;
                    this.type = 'HashPair';
                    this.key = key;
                    this.value = value;
                },
                helpers: {
                    helperExpression: function helperExpression(node) {
                        return !!(node.type === 'SubExpression' || node.params.length || node.hash);
                    },
                    scopedId: function scopedId(path) {
                        return /^\.|this\b/.test(path.original);
                    },
                    simpleId: function simpleId(path) {
                        return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;
                    }
                }
            };
            exports['default'] = AST;
            module.exports = exports['default'];
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            exports.parse = parse;
            var _parser = __webpack_require__(14);
            var _parser2 = _interopRequireWildcard(_parser);
            var _AST = __webpack_require__(2);
            var _AST2 = _interopRequireWildcard(_AST);
            var _WhitespaceControl = __webpack_require__(15);
            var _WhitespaceControl2 = _interopRequireWildcard(_WhitespaceControl);
            var _import = __webpack_require__(16);
            var Helpers = _interopRequireWildcard(_import);
            var _extend = __webpack_require__(12);
            exports.parser = _parser2['default'];
            var yy = {};
            _extend.extend(yy, Helpers, _AST2['default']);
            function parse(input, options) {
                if (input.type === 'Program') {
                    return input;
                }
                _parser2['default'].yy = yy;
                yy.locInfo = function (locInfo) {
                    return new yy.SourceLocation(options && options.srcName, locInfo);
                };
                var strip = new _WhitespaceControl2['default']();
                return strip.accept(_parser2['default'].parse(input));
            }
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            exports.Compiler = Compiler;
            exports.precompile = precompile;
            exports.compile = compile;
            var _Exception = __webpack_require__(11);
            var _Exception2 = _interopRequireWildcard(_Exception);
            var _isArray$indexOf = __webpack_require__(12);
            var _AST = __webpack_require__(2);
            var _AST2 = _interopRequireWildcard(_AST);
            var slice = [].slice;
            function Compiler() {
            }
            Compiler.prototype = {
                compiler: Compiler,
                equals: function equals(other) {
                    var len = this.opcodes.length;
                    if (other.opcodes.length !== len) {
                        return false;
                    }
                    for (var i = 0; i < len; i++) {
                        var opcode = this.opcodes[i], otherOpcode = other.opcodes[i];
                        if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
                            return false;
                        }
                    }
                    len = this.children.length;
                    for (var i = 0; i < len; i++) {
                        if (!this.children[i].equals(other.children[i])) {
                            return false;
                        }
                    }
                    return true;
                },
                guid: 0,
                compile: function compile(program, options) {
                    this.sourceNode = [];
                    this.opcodes = [];
                    this.children = [];
                    this.options = options;
                    this.stringParams = options.stringParams;
                    this.trackIds = options.trackIds;
                    options.blockParams = options.blockParams || [];
                    var knownHelpers = options.knownHelpers;
                    options.knownHelpers = {
                        helperMissing: true,
                        blockHelperMissing: true,
                        each: true,
                        'if': true,
                        unless: true,
                        'with': true,
                        log: true,
                        lookup: true
                    };
                    if (knownHelpers) {
                        for (var _name in knownHelpers) {
                            if (_name in knownHelpers) {
                                options.knownHelpers[_name] = knownHelpers[_name];
                            }
                        }
                    }
                    return this.accept(program);
                },
                compileProgram: function compileProgram(program) {
                    var childCompiler = new this.compiler(), result = childCompiler.compile(program, this.options), guid = this.guid++;
                    this.usePartial = this.usePartial || result.usePartial;
                    this.children[guid] = result;
                    this.useDepths = this.useDepths || result.useDepths;
                    return guid;
                },
                accept: function accept(node) {
                    this.sourceNode.unshift(node);
                    var ret = this[node.type](node);
                    this.sourceNode.shift();
                    return ret;
                },
                Program: function Program(program) {
                    this.options.blockParams.unshift(program.blockParams);
                    var body = program.body, bodyLength = body.length;
                    for (var i = 0; i < bodyLength; i++) {
                        this.accept(body[i]);
                    }
                    this.options.blockParams.shift();
                    this.isSimple = bodyLength === 1;
                    this.blockParams = program.blockParams ? program.blockParams.length : 0;
                    return this;
                },
                BlockStatement: function BlockStatement(block) {
                    transformLiteralToPath(block);
                    var program = block.program, inverse = block.inverse;
                    program = program && this.compileProgram(program);
                    inverse = inverse && this.compileProgram(inverse);
                    var type = this.classifySexpr(block);
                    if (type === 'helper') {
                        this.helperSexpr(block, program, inverse);
                    } else if (type === 'simple') {
                        this.simpleSexpr(block);
                        this.opcode('pushProgram', program);
                        this.opcode('pushProgram', inverse);
                        this.opcode('emptyHash');
                        this.opcode('blockValue', block.path.original);
                    } else {
                        this.ambiguousSexpr(block, program, inverse);
                        this.opcode('pushProgram', program);
                        this.opcode('pushProgram', inverse);
                        this.opcode('emptyHash');
                        this.opcode('ambiguousBlockValue');
                    }
                    this.opcode('append');
                },
                PartialStatement: function PartialStatement(partial) {
                    this.usePartial = true;
                    var params = partial.params;
                    if (params.length > 1) {
                        throw new _Exception2['default']('Unsupported number of partial arguments: ' + params.length, partial);
                    } else if (!params.length) {
                        params.push({
                            type: 'PathExpression',
                            parts: [],
                            depth: 0
                        });
                    }
                    var partialName = partial.name.original, isDynamic = partial.name.type === 'SubExpression';
                    if (isDynamic) {
                        this.accept(partial.name);
                    }
                    this.setupFullMustacheParams(partial, undefined, undefined, true);
                    var indent = partial.indent || '';
                    if (this.options.preventIndent && indent) {
                        this.opcode('appendContent', indent);
                        indent = '';
                    }
                    this.opcode('invokePartial', isDynamic, partialName, indent);
                    this.opcode('append');
                },
                MustacheStatement: function MustacheStatement(mustache) {
                    this.SubExpression(mustache);
                    if (mustache.escaped && !this.options.noEscape) {
                        this.opcode('appendEscaped');
                    } else {
                        this.opcode('append');
                    }
                },
                ContentStatement: function ContentStatement(content) {
                    if (content.value) {
                        this.opcode('appendContent', content.value);
                    }
                },
                CommentStatement: function CommentStatement() {
                },
                SubExpression: function SubExpression(sexpr) {
                    transformLiteralToPath(sexpr);
                    var type = this.classifySexpr(sexpr);
                    if (type === 'simple') {
                        this.simpleSexpr(sexpr);
                    } else if (type === 'helper') {
                        this.helperSexpr(sexpr);
                    } else {
                        this.ambiguousSexpr(sexpr);
                    }
                },
                ambiguousSexpr: function ambiguousSexpr(sexpr, program, inverse) {
                    var path = sexpr.path, name = path.parts[0], isBlock = program != null || inverse != null;
                    this.opcode('getContext', path.depth);
                    this.opcode('pushProgram', program);
                    this.opcode('pushProgram', inverse);
                    this.accept(path);
                    this.opcode('invokeAmbiguous', name, isBlock);
                },
                simpleSexpr: function simpleSexpr(sexpr) {
                    this.accept(sexpr.path);
                    this.opcode('resolvePossibleLambda');
                },
                helperSexpr: function helperSexpr(sexpr, program, inverse) {
                    var params = this.setupFullMustacheParams(sexpr, program, inverse), path = sexpr.path, name = path.parts[0];
                    if (this.options.knownHelpers[name]) {
                        this.opcode('invokeKnownHelper', params.length, name);
                    } else if (this.options.knownHelpersOnly) {
                        throw new _Exception2['default']('You specified knownHelpersOnly, but used the unknown helper ' + name, sexpr);
                    } else {
                        path.falsy = true;
                        this.accept(path);
                        this.opcode('invokeHelper', params.length, path.original, _AST2['default'].helpers.simpleId(path));
                    }
                },
                PathExpression: function PathExpression(path) {
                    this.addDepth(path.depth);
                    this.opcode('getContext', path.depth);
                    var name = path.parts[0], scoped = _AST2['default'].helpers.scopedId(path), blockParamId = !path.depth && !scoped && this.blockParamIndex(name);
                    if (blockParamId) {
                        this.opcode('lookupBlockParam', blockParamId, path.parts);
                    } else if (!name) {
                        this.opcode('pushContext');
                    } else if (path.data) {
                        this.options.data = true;
                        this.opcode('lookupData', path.depth, path.parts);
                    } else {
                        this.opcode('lookupOnContext', path.parts, path.falsy, scoped);
                    }
                },
                StringLiteral: function StringLiteral(string) {
                    this.opcode('pushString', string.value);
                },
                NumberLiteral: function NumberLiteral(number) {
                    this.opcode('pushLiteral', number.value);
                },
                BooleanLiteral: function BooleanLiteral(bool) {
                    this.opcode('pushLiteral', bool.value);
                },
                UndefinedLiteral: function UndefinedLiteral() {
                    this.opcode('pushLiteral', 'undefined');
                },
                NullLiteral: function NullLiteral() {
                    this.opcode('pushLiteral', 'null');
                },
                Hash: function Hash(hash) {
                    var pairs = hash.pairs, i = 0, l = pairs.length;
                    this.opcode('pushHash');
                    for (; i < l; i++) {
                        this.pushParam(pairs[i].value);
                    }
                    while (i--) {
                        this.opcode('assignToHash', pairs[i].key);
                    }
                    this.opcode('popHash');
                },
                opcode: function opcode(name) {
                    this.opcodes.push({
                        opcode: name,
                        args: slice.call(arguments, 1),
                        loc: this.sourceNode[0].loc
                    });
                },
                addDepth: function addDepth(depth) {
                    if (!depth) {
                        return;
                    }
                    this.useDepths = true;
                },
                classifySexpr: function classifySexpr(sexpr) {
                    var isSimple = _AST2['default'].helpers.simpleId(sexpr.path);
                    var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);
                    var isHelper = !isBlockParam && _AST2['default'].helpers.helperExpression(sexpr);
                    var isEligible = !isBlockParam && (isHelper || isSimple);
                    if (isEligible && !isHelper) {
                        var _name2 = sexpr.path.parts[0], options = this.options;
                        if (options.knownHelpers[_name2]) {
                            isHelper = true;
                        } else if (options.knownHelpersOnly) {
                            isEligible = false;
                        }
                    }
                    if (isHelper) {
                        return 'helper';
                    } else if (isEligible) {
                        return 'ambiguous';
                    } else {
                        return 'simple';
                    }
                },
                pushParams: function pushParams(params) {
                    for (var i = 0, l = params.length; i < l; i++) {
                        this.pushParam(params[i]);
                    }
                },
                pushParam: function pushParam(val) {
                    var value = val.value != null ? val.value : val.original || '';
                    if (this.stringParams) {
                        if (value.replace) {
                            value = value.replace(/^(\.?\.\/)*/g, '').replace(/\//g, '.');
                        }
                        if (val.depth) {
                            this.addDepth(val.depth);
                        }
                        this.opcode('getContext', val.depth || 0);
                        this.opcode('pushStringParam', value, val.type);
                        if (val.type === 'SubExpression') {
                            this.accept(val);
                        }
                    } else {
                        if (this.trackIds) {
                            var blockParamIndex = undefined;
                            if (val.parts && !_AST2['default'].helpers.scopedId(val) && !val.depth) {
                                blockParamIndex = this.blockParamIndex(val.parts[0]);
                            }
                            if (blockParamIndex) {
                                var blockParamChild = val.parts.slice(1).join('.');
                                this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);
                            } else {
                                value = val.original || value;
                                if (value.replace) {
                                    value = value.replace(/^\.\//g, '').replace(/^\.$/g, '');
                                }
                                this.opcode('pushId', val.type, value);
                            }
                        }
                        this.accept(val);
                    }
                },
                setupFullMustacheParams: function setupFullMustacheParams(sexpr, program, inverse, omitEmpty) {
                    var params = sexpr.params;
                    this.pushParams(params);
                    this.opcode('pushProgram', program);
                    this.opcode('pushProgram', inverse);
                    if (sexpr.hash) {
                        this.accept(sexpr.hash);
                    } else {
                        this.opcode('emptyHash', omitEmpty);
                    }
                    return params;
                },
                blockParamIndex: function blockParamIndex(name) {
                    for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {
                        var blockParams = this.options.blockParams[depth], param = blockParams && _isArray$indexOf.indexOf(blockParams, name);
                        if (blockParams && param >= 0) {
                            return [
                                depth,
                                param
                            ];
                        }
                    }
                }
            };
            function precompile(input, options, env) {
                if (input == null || typeof input !== 'string' && input.type !== 'Program') {
                    throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed ' + input);
                }
                options = options || {};
                if (!('data' in options)) {
                    options.data = true;
                }
                if (options.compat) {
                    options.useDepths = true;
                }
                var ast = env.parse(input, options), environment = new env.Compiler().compile(ast, options);
                return new env.JavaScriptCompiler().compile(environment, options);
            }
            function compile(input, _x, env) {
                var options = arguments[1] === undefined ? {} : arguments[1];
                if (input == null || typeof input !== 'string' && input.type !== 'Program') {
                    throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed ' + input);
                }
                if (!('data' in options)) {
                    options.data = true;
                }
                if (options.compat) {
                    options.useDepths = true;
                }
                var compiled = undefined;
                function compileInput() {
                    var ast = env.parse(input, options), environment = new env.Compiler().compile(ast, options), templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
                    return env.template(templateSpec);
                }
                function ret(context, execOptions) {
                    if (!compiled) {
                        compiled = compileInput();
                    }
                    return compiled.call(this, context, execOptions);
                }
                ret._setup = function (setupOptions) {
                    if (!compiled) {
                        compiled = compileInput();
                    }
                    return compiled._setup(setupOptions);
                };
                ret._child = function (i, data, blockParams, depths) {
                    if (!compiled) {
                        compiled = compileInput();
                    }
                    return compiled._child(i, data, blockParams, depths);
                };
                return ret;
            }
            function argEquals(a, b) {
                if (a === b) {
                    return true;
                }
                if (_isArray$indexOf.isArray(a) && _isArray$indexOf.isArray(b) && a.length === b.length) {
                    for (var i = 0; i < a.length; i++) {
                        if (!argEquals(a[i], b[i])) {
                            return false;
                        }
                    }
                    return true;
                }
            }
            function transformLiteralToPath(sexpr) {
                if (!sexpr.path.parts) {
                    var literal = sexpr.path;
                    sexpr.path = new _AST2['default'].PathExpression(false, 0, [literal.original + ''], literal.original + '', literal.loc);
                }
            }
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            var _COMPILER_REVISION$REVISION_CHANGES = __webpack_require__(9);
            var _Exception = __webpack_require__(11);
            var _Exception2 = _interopRequireWildcard(_Exception);
            var _isArray = __webpack_require__(12);
            var _CodeGen = __webpack_require__(17);
            var _CodeGen2 = _interopRequireWildcard(_CodeGen);
            function Literal(value) {
                this.value = value;
            }
            function JavaScriptCompiler() {
            }
            JavaScriptCompiler.prototype = {
                nameLookup: function nameLookup(parent, name) {
                    if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
                        return [
                            parent,
                            '.',
                            name
                        ];
                    } else {
                        return [
                            parent,
                            '[\'',
                            name,
                            '\']'
                        ];
                    }
                },
                depthedLookup: function depthedLookup(name) {
                    return [
                        this.aliasable('this.lookup'),
                        '(depths, "',
                        name,
                        '")'
                    ];
                },
                compilerInfo: function compilerInfo() {
                    var revision = _COMPILER_REVISION$REVISION_CHANGES.COMPILER_REVISION, versions = _COMPILER_REVISION$REVISION_CHANGES.REVISION_CHANGES[revision];
                    return [
                        revision,
                        versions
                    ];
                },
                appendToBuffer: function appendToBuffer(source, location, explicit) {
                    if (!_isArray.isArray(source)) {
                        source = [source];
                    }
                    source = this.source.wrap(source, location);
                    if (this.environment.isSimple) {
                        return [
                            'return ',
                            source,
                            ';'
                        ];
                    } else if (explicit) {
                        return [
                            'buffer += ',
                            source,
                            ';'
                        ];
                    } else {
                        source.appendToBuffer = true;
                        return source;
                    }
                },
                initializeBuffer: function initializeBuffer() {
                    return this.quotedString('');
                },
                compile: function compile(environment, options, context, asObject) {
                    this.environment = environment;
                    this.options = options;
                    this.stringParams = this.options.stringParams;
                    this.trackIds = this.options.trackIds;
                    this.precompile = !asObject;
                    this.name = this.environment.name;
                    this.isChild = !!context;
                    this.context = context || {
                        programs: [],
                        environments: []
                    };
                    this.preamble();
                    this.stackSlot = 0;
                    this.stackVars = [];
                    this.aliases = {};
                    this.registers = { list: [] };
                    this.hashes = [];
                    this.compileStack = [];
                    this.inlineStack = [];
                    this.blockParams = [];
                    this.compileChildren(environment, options);
                    this.useDepths = this.useDepths || environment.useDepths || this.options.compat;
                    this.useBlockParams = this.useBlockParams || environment.useBlockParams;
                    var opcodes = environment.opcodes, opcode = undefined, firstLoc = undefined, i = undefined, l = undefined;
                    for (i = 0, l = opcodes.length; i < l; i++) {
                        opcode = opcodes[i];
                        this.source.currentLocation = opcode.loc;
                        firstLoc = firstLoc || opcode.loc;
                        this[opcode.opcode].apply(this, opcode.args);
                    }
                    this.source.currentLocation = firstLoc;
                    this.pushSource('');
                    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
                        throw new _Exception2['default']('Compile completed with content left on stack');
                    }
                    var fn = this.createFunctionContext(asObject);
                    if (!this.isChild) {
                        var ret = {
                            compiler: this.compilerInfo(),
                            main: fn
                        };
                        var programs = this.context.programs;
                        for (i = 0, l = programs.length; i < l; i++) {
                            if (programs[i]) {
                                ret[i] = programs[i];
                            }
                        }
                        if (this.environment.usePartial) {
                            ret.usePartial = true;
                        }
                        if (this.options.data) {
                            ret.useData = true;
                        }
                        if (this.useDepths) {
                            ret.useDepths = true;
                        }
                        if (this.useBlockParams) {
                            ret.useBlockParams = true;
                        }
                        if (this.options.compat) {
                            ret.compat = true;
                        }
                        if (!asObject) {
                            ret.compiler = JSON.stringify(ret.compiler);
                            this.source.currentLocation = {
                                start: {
                                    line: 1,
                                    column: 0
                                }
                            };
                            ret = this.objectLiteral(ret);
                            if (options.srcName) {
                                ret = ret.toStringWithSourceMap({ file: options.destName });
                                ret.map = ret.map && ret.map.toString();
                            } else {
                                ret = ret.toString();
                            }
                        } else {
                            ret.compilerOptions = this.options;
                        }
                        return ret;
                    } else {
                        return fn;
                    }
                },
                preamble: function preamble() {
                    this.lastContext = 0;
                    this.source = new _CodeGen2['default'](this.options.srcName);
                },
                createFunctionContext: function createFunctionContext(asObject) {
                    var varDeclarations = '';
                    var locals = this.stackVars.concat(this.registers.list);
                    if (locals.length > 0) {
                        varDeclarations += ', ' + locals.join(', ');
                    }
                    var aliasCount = 0;
                    for (var alias in this.aliases) {
                        var node = this.aliases[alias];
                        if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {
                            varDeclarations += ', alias' + ++aliasCount + '=' + alias;
                            node.children[0] = 'alias' + aliasCount;
                        }
                    }
                    var params = [
                        'depth0',
                        'helpers',
                        'partials',
                        'data'
                    ];
                    if (this.useBlockParams || this.useDepths) {
                        params.push('blockParams');
                    }
                    if (this.useDepths) {
                        params.push('depths');
                    }
                    var source = this.mergeSource(varDeclarations);
                    if (asObject) {
                        params.push(source);
                        return Function.apply(this, params);
                    } else {
                        return this.source.wrap([
                            'function(',
                            params.join(','),
                            ') {\n  ',
                            source,
                            '}'
                        ]);
                    }
                },
                mergeSource: function mergeSource(varDeclarations) {
                    var isSimple = this.environment.isSimple, appendOnly = !this.forceBuffer, appendFirst = undefined, sourceSeen = undefined, bufferStart = undefined, bufferEnd = undefined;
                    this.source.each(function (line) {
                        if (line.appendToBuffer) {
                            if (bufferStart) {
                                line.prepend('  + ');
                            } else {
                                bufferStart = line;
                            }
                            bufferEnd = line;
                        } else {
                            if (bufferStart) {
                                if (!sourceSeen) {
                                    appendFirst = true;
                                } else {
                                    bufferStart.prepend('buffer += ');
                                }
                                bufferEnd.add(';');
                                bufferStart = bufferEnd = undefined;
                            }
                            sourceSeen = true;
                            if (!isSimple) {
                                appendOnly = false;
                            }
                        }
                    });
                    if (appendOnly) {
                        if (bufferStart) {
                            bufferStart.prepend('return ');
                            bufferEnd.add(';');
                        } else if (!sourceSeen) {
                            this.source.push('return "";');
                        }
                    } else {
                        varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());
                        if (bufferStart) {
                            bufferStart.prepend('return buffer + ');
                            bufferEnd.add(';');
                        } else {
                            this.source.push('return buffer;');
                        }
                    }
                    if (varDeclarations) {
                        this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
                    }
                    return this.source.merge();
                },
                blockValue: function blockValue(name) {
                    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'), params = [this.contextName(0)];
                    this.setupHelperArgs(name, 0, params);
                    var blockName = this.popStack();
                    params.splice(1, 0, blockName);
                    this.push(this.source.functionCall(blockHelperMissing, 'call', params));
                },
                ambiguousBlockValue: function ambiguousBlockValue() {
                    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'), params = [this.contextName(0)];
                    this.setupHelperArgs('', 0, params, true);
                    this.flushInline();
                    var current = this.topStack();
                    params.splice(1, 0, current);
                    this.pushSource([
                        'if (!',
                        this.lastHelper,
                        ') { ',
                        current,
                        ' = ',
                        this.source.functionCall(blockHelperMissing, 'call', params),
                        '}'
                    ]);
                },
                appendContent: function appendContent(content) {
                    if (this.pendingContent) {
                        content = this.pendingContent + content;
                    } else {
                        this.pendingLocation = this.source.currentLocation;
                    }
                    this.pendingContent = content;
                },
                append: function append() {
                    if (this.isInline()) {
                        this.replaceStack(function (current) {
                            return [
                                ' != null ? ',
                                current,
                                ' : ""'
                            ];
                        });
                        this.pushSource(this.appendToBuffer(this.popStack()));
                    } else {
                        var local = this.popStack();
                        this.pushSource([
                            'if (',
                            local,
                            ' != null) { ',
                            this.appendToBuffer(local, undefined, true),
                            ' }'
                        ]);
                        if (this.environment.isSimple) {
                            this.pushSource([
                                'else { ',
                                this.appendToBuffer('\'\'', undefined, true),
                                ' }'
                            ]);
                        }
                    }
                },
                appendEscaped: function appendEscaped() {
                    this.pushSource(this.appendToBuffer([
                        this.aliasable('this.escapeExpression'),
                        '(',
                        this.popStack(),
                        ')'
                    ]));
                },
                getContext: function getContext(depth) {
                    this.lastContext = depth;
                },
                pushContext: function pushContext() {
                    this.pushStackLiteral(this.contextName(this.lastContext));
                },
                lookupOnContext: function lookupOnContext(parts, falsy, scoped) {
                    var i = 0;
                    if (!scoped && this.options.compat && !this.lastContext) {
                        this.push(this.depthedLookup(parts[i++]));
                    } else {
                        this.pushContext();
                    }
                    this.resolvePath('context', parts, i, falsy);
                },
                lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
                    this.useBlockParams = true;
                    this.push([
                        'blockParams[',
                        blockParamId[0],
                        '][',
                        blockParamId[1],
                        ']'
                    ]);
                    this.resolvePath('context', parts, 1);
                },
                lookupData: function lookupData(depth, parts) {
                    if (!depth) {
                        this.pushStackLiteral('data');
                    } else {
                        this.pushStackLiteral('this.data(data, ' + depth + ')');
                    }
                    this.resolvePath('data', parts, 0, true);
                },
                resolvePath: function resolvePath(type, parts, i, falsy) {
                    var _this = this;
                    if (this.options.strict || this.options.assumeObjects) {
                        this.push(strictLookup(this.options.strict, this, parts, type));
                        return;
                    }
                    var len = parts.length;
                    for (; i < len; i++) {
                        this.replaceStack(function (current) {
                            var lookup = _this.nameLookup(current, parts[i], type);
                            if (!falsy) {
                                return [
                                    ' != null ? ',
                                    lookup,
                                    ' : ',
                                    current
                                ];
                            } else {
                                return [
                                    ' && ',
                                    lookup
                                ];
                            }
                        });
                    }
                },
                resolvePossibleLambda: function resolvePossibleLambda() {
                    this.push([
                        this.aliasable('this.lambda'),
                        '(',
                        this.popStack(),
                        ', ',
                        this.contextName(0),
                        ')'
                    ]);
                },
                pushStringParam: function pushStringParam(string, type) {
                    this.pushContext();
                    this.pushString(type);
                    if (type !== 'SubExpression') {
                        if (typeof string === 'string') {
                            this.pushString(string);
                        } else {
                            this.pushStackLiteral(string);
                        }
                    }
                },
                emptyHash: function emptyHash(omitEmpty) {
                    if (this.trackIds) {
                        this.push('{}');
                    }
                    if (this.stringParams) {
                        this.push('{}');
                        this.push('{}');
                    }
                    this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
                },
                pushHash: function pushHash() {
                    if (this.hash) {
                        this.hashes.push(this.hash);
                    }
                    this.hash = {
                        values: [],
                        types: [],
                        contexts: [],
                        ids: []
                    };
                },
                popHash: function popHash() {
                    var hash = this.hash;
                    this.hash = this.hashes.pop();
                    if (this.trackIds) {
                        this.push(this.objectLiteral(hash.ids));
                    }
                    if (this.stringParams) {
                        this.push(this.objectLiteral(hash.contexts));
                        this.push(this.objectLiteral(hash.types));
                    }
                    this.push(this.objectLiteral(hash.values));
                },
                pushString: function pushString(string) {
                    this.pushStackLiteral(this.quotedString(string));
                },
                pushLiteral: function pushLiteral(value) {
                    this.pushStackLiteral(value);
                },
                pushProgram: function pushProgram(guid) {
                    if (guid != null) {
                        this.pushStackLiteral(this.programExpression(guid));
                    } else {
                        this.pushStackLiteral(null);
                    }
                },
                invokeHelper: function invokeHelper(paramSize, name, isSimple) {
                    var nonHelper = this.popStack(), helper = this.setupHelper(paramSize, name), simple = isSimple ? [
                            helper.name,
                            ' || '
                        ] : '';
                    var lookup = ['('].concat(simple, nonHelper);
                    if (!this.options.strict) {
                        lookup.push(' || ', this.aliasable('helpers.helperMissing'));
                    }
                    lookup.push(')');
                    this.push(this.source.functionCall(lookup, 'call', helper.callParams));
                },
                invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
                    var helper = this.setupHelper(paramSize, name);
                    this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
                },
                invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
                    this.useRegister('helper');
                    var nonHelper = this.popStack();
                    this.emptyHash();
                    var helper = this.setupHelper(0, name, helperCall);
                    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');
                    var lookup = [
                        '(',
                        '(helper = ',
                        helperName,
                        ' || ',
                        nonHelper,
                        ')'
                    ];
                    if (!this.options.strict) {
                        lookup[0] = '(helper = ';
                        lookup.push(' != null ? helper : ', this.aliasable('helpers.helperMissing'));
                    }
                    this.push([
                        '(',
                        lookup,
                        helper.paramsInit ? [
                            '),(',
                            helper.paramsInit
                        ] : [],
                        '),',
                        '(typeof helper === ',
                        this.aliasable('"function"'),
                        ' ? ',
                        this.source.functionCall('helper', 'call', helper.callParams),
                        ' : helper))'
                    ]);
                },
                invokePartial: function invokePartial(isDynamic, name, indent) {
                    var params = [], options = this.setupParams(name, 1, params, false);
                    if (isDynamic) {
                        name = this.popStack();
                        delete options.name;
                    }
                    if (indent) {
                        options.indent = JSON.stringify(indent);
                    }
                    options.helpers = 'helpers';
                    options.partials = 'partials';
                    if (!isDynamic) {
                        params.unshift(this.nameLookup('partials', name, 'partial'));
                    } else {
                        params.unshift(name);
                    }
                    if (this.options.compat) {
                        options.depths = 'depths';
                    }
                    options = this.objectLiteral(options);
                    params.push(options);
                    this.push(this.source.functionCall('this.invokePartial', '', params));
                },
                assignToHash: function assignToHash(key) {
                    var value = this.popStack(), context = undefined, type = undefined, id = undefined;
                    if (this.trackIds) {
                        id = this.popStack();
                    }
                    if (this.stringParams) {
                        type = this.popStack();
                        context = this.popStack();
                    }
                    var hash = this.hash;
                    if (context) {
                        hash.contexts[key] = context;
                    }
                    if (type) {
                        hash.types[key] = type;
                    }
                    if (id) {
                        hash.ids[key] = id;
                    }
                    hash.values[key] = value;
                },
                pushId: function pushId(type, name, child) {
                    if (type === 'BlockParam') {
                        this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));
                    } else if (type === 'PathExpression') {
                        this.pushString(name);
                    } else if (type === 'SubExpression') {
                        this.pushStackLiteral('true');
                    } else {
                        this.pushStackLiteral('null');
                    }
                },
                compiler: JavaScriptCompiler,
                compileChildren: function compileChildren(environment, options) {
                    var children = environment.children, child = undefined, compiler = undefined;
                    for (var i = 0, l = children.length; i < l; i++) {
                        child = children[i];
                        compiler = new this.compiler();
                        var index = this.matchExistingProgram(child);
                        if (index == null) {
                            this.context.programs.push('');
                            index = this.context.programs.length;
                            child.index = index;
                            child.name = 'program' + index;
                            this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
                            this.context.environments[index] = child;
                            this.useDepths = this.useDepths || compiler.useDepths;
                            this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
                        } else {
                            child.index = index;
                            child.name = 'program' + index;
                            this.useDepths = this.useDepths || child.useDepths;
                            this.useBlockParams = this.useBlockParams || child.useBlockParams;
                        }
                    }
                },
                matchExistingProgram: function matchExistingProgram(child) {
                    for (var i = 0, len = this.context.environments.length; i < len; i++) {
                        var environment = this.context.environments[i];
                        if (environment && environment.equals(child)) {
                            return i;
                        }
                    }
                },
                programExpression: function programExpression(guid) {
                    var child = this.environment.children[guid], programParams = [
                            child.index,
                            'data',
                            child.blockParams
                        ];
                    if (this.useBlockParams || this.useDepths) {
                        programParams.push('blockParams');
                    }
                    if (this.useDepths) {
                        programParams.push('depths');
                    }
                    return 'this.program(' + programParams.join(', ') + ')';
                },
                useRegister: function useRegister(name) {
                    if (!this.registers[name]) {
                        this.registers[name] = true;
                        this.registers.list.push(name);
                    }
                },
                push: function push(expr) {
                    if (!(expr instanceof Literal)) {
                        expr = this.source.wrap(expr);
                    }
                    this.inlineStack.push(expr);
                    return expr;
                },
                pushStackLiteral: function pushStackLiteral(item) {
                    this.push(new Literal(item));
                },
                pushSource: function pushSource(source) {
                    if (this.pendingContent) {
                        this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
                        this.pendingContent = undefined;
                    }
                    if (source) {
                        this.source.push(source);
                    }
                },
                replaceStack: function replaceStack(callback) {
                    var prefix = ['('], stack = undefined, createdStack = undefined, usedLiteral = undefined;
                    if (!this.isInline()) {
                        throw new _Exception2['default']('replaceStack on non-inline');
                    }
                    var top = this.popStack(true);
                    if (top instanceof Literal) {
                        stack = [top.value];
                        prefix = [
                            '(',
                            stack
                        ];
                        usedLiteral = true;
                    } else {
                        createdStack = true;
                        var _name = this.incrStack();
                        prefix = [
                            '((',
                            this.push(_name),
                            ' = ',
                            top,
                            ')'
                        ];
                        stack = this.topStack();
                    }
                    var item = callback.call(this, stack);
                    if (!usedLiteral) {
                        this.popStack();
                    }
                    if (createdStack) {
                        this.stackSlot--;
                    }
                    this.push(prefix.concat(item, ')'));
                },
                incrStack: function incrStack() {
                    this.stackSlot++;
                    if (this.stackSlot > this.stackVars.length) {
                        this.stackVars.push('stack' + this.stackSlot);
                    }
                    return this.topStackName();
                },
                topStackName: function topStackName() {
                    return 'stack' + this.stackSlot;
                },
                flushInline: function flushInline() {
                    var inlineStack = this.inlineStack;
                    this.inlineStack = [];
                    for (var i = 0, len = inlineStack.length; i < len; i++) {
                        var entry = inlineStack[i];
                        if (entry instanceof Literal) {
                            this.compileStack.push(entry);
                        } else {
                            var stack = this.incrStack();
                            this.pushSource([
                                stack,
                                ' = ',
                                entry,
                                ';'
                            ]);
                            this.compileStack.push(stack);
                        }
                    }
                },
                isInline: function isInline() {
                    return this.inlineStack.length;
                },
                popStack: function popStack(wrapped) {
                    var inline = this.isInline(), item = (inline ? this.inlineStack : this.compileStack).pop();
                    if (!wrapped && item instanceof Literal) {
                        return item.value;
                    } else {
                        if (!inline) {
                            if (!this.stackSlot) {
                                throw new _Exception2['default']('Invalid stack pop');
                            }
                            this.stackSlot--;
                        }
                        return item;
                    }
                },
                topStack: function topStack() {
                    var stack = this.isInline() ? this.inlineStack : this.compileStack, item = stack[stack.length - 1];
                    if (item instanceof Literal) {
                        return item.value;
                    } else {
                        return item;
                    }
                },
                contextName: function contextName(context) {
                    if (this.useDepths && context) {
                        return 'depths[' + context + ']';
                    } else {
                        return 'depth' + context;
                    }
                },
                quotedString: function quotedString(str) {
                    return this.source.quotedString(str);
                },
                objectLiteral: function objectLiteral(obj) {
                    return this.source.objectLiteral(obj);
                },
                aliasable: function aliasable(name) {
                    var ret = this.aliases[name];
                    if (ret) {
                        ret.referenceCount++;
                        return ret;
                    }
                    ret = this.aliases[name] = this.source.wrap(name);
                    ret.aliasable = true;
                    ret.referenceCount = 1;
                    return ret;
                },
                setupHelper: function setupHelper(paramSize, name, blockHelper) {
                    var params = [], paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
                    var foundHelper = this.nameLookup('helpers', name, 'helper');
                    return {
                        params: params,
                        paramsInit: paramsInit,
                        name: foundHelper,
                        callParams: [this.contextName(0)].concat(params)
                    };
                },
                setupParams: function setupParams(helper, paramSize, params) {
                    var options = {}, contexts = [], types = [], ids = [], param = undefined;
                    options.name = this.quotedString(helper);
                    options.hash = this.popStack();
                    if (this.trackIds) {
                        options.hashIds = this.popStack();
                    }
                    if (this.stringParams) {
                        options.hashTypes = this.popStack();
                        options.hashContexts = this.popStack();
                    }
                    var inverse = this.popStack(), program = this.popStack();
                    if (program || inverse) {
                        options.fn = program || 'this.noop';
                        options.inverse = inverse || 'this.noop';
                    }
                    var i = paramSize;
                    while (i--) {
                        param = this.popStack();
                        params[i] = param;
                        if (this.trackIds) {
                            ids[i] = this.popStack();
                        }
                        if (this.stringParams) {
                            types[i] = this.popStack();
                            contexts[i] = this.popStack();
                        }
                    }
                    if (this.trackIds) {
                        options.ids = this.source.generateArray(ids);
                    }
                    if (this.stringParams) {
                        options.types = this.source.generateArray(types);
                        options.contexts = this.source.generateArray(contexts);
                    }
                    if (this.options.data) {
                        options.data = 'data';
                    }
                    if (this.useBlockParams) {
                        options.blockParams = 'blockParams';
                    }
                    return options;
                },
                setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
                    var options = this.setupParams(helper, paramSize, params, true);
                    options = this.objectLiteral(options);
                    if (useRegister) {
                        this.useRegister('options');
                        params.push('options');
                        return [
                            'options=',
                            options
                        ];
                    } else {
                        params.push(options);
                        return '';
                    }
                }
            };
            (function () {
                var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');
                var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};
                for (var i = 0, l = reservedWords.length; i < l; i++) {
                    compilerWords[reservedWords[i]] = true;
                }
            }());
            JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
                return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
            };
            function strictLookup(requireTerminal, compiler, parts, type) {
                var stack = compiler.popStack(), i = 0, len = parts.length;
                if (requireTerminal) {
                    len--;
                }
                for (; i < len; i++) {
                    stack = compiler.nameLookup(stack, parts[i], type);
                }
                if (requireTerminal) {
                    return [
                        compiler.aliasable('this.strict'),
                        '(',
                        stack,
                        ', ',
                        compiler.quotedString(parts[i]),
                        ')'
                    ];
                } else {
                    return stack;
                }
            }
            exports['default'] = JavaScriptCompiler;
            module.exports = exports['default'];
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            var _Exception = __webpack_require__(11);
            var _Exception2 = _interopRequireWildcard(_Exception);
            var _AST = __webpack_require__(2);
            var _AST2 = _interopRequireWildcard(_AST);
            function Visitor() {
                this.parents = [];
            }
            Visitor.prototype = {
                constructor: Visitor,
                mutating: false,
                acceptKey: function acceptKey(node, name) {
                    var value = this.accept(node[name]);
                    if (this.mutating) {
                        if (value && (!value.type || !_AST2['default'][value.type])) {
                            throw new _Exception2['default']('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
                        }
                        node[name] = value;
                    }
                },
                acceptRequired: function acceptRequired(node, name) {
                    this.acceptKey(node, name);
                    if (!node[name]) {
                        throw new _Exception2['default'](node.type + ' requires ' + name);
                    }
                },
                acceptArray: function acceptArray(array) {
                    for (var i = 0, l = array.length; i < l; i++) {
                        this.acceptKey(array, i);
                        if (!array[i]) {
                            array.splice(i, 1);
                            i--;
                            l--;
                        }
                    }
                },
                accept: function accept(object) {
                    if (!object) {
                        return;
                    }
                    if (this.current) {
                        this.parents.unshift(this.current);
                    }
                    this.current = object;
                    var ret = this[object.type](object);
                    this.current = this.parents.shift();
                    if (!this.mutating || ret) {
                        return ret;
                    } else if (ret !== false) {
                        return object;
                    }
                },
                Program: function Program(program) {
                    this.acceptArray(program.body);
                },
                MustacheStatement: function MustacheStatement(mustache) {
                    this.acceptRequired(mustache, 'path');
                    this.acceptArray(mustache.params);
                    this.acceptKey(mustache, 'hash');
                },
                BlockStatement: function BlockStatement(block) {
                    this.acceptRequired(block, 'path');
                    this.acceptArray(block.params);
                    this.acceptKey(block, 'hash');
                    this.acceptKey(block, 'program');
                    this.acceptKey(block, 'inverse');
                },
                PartialStatement: function PartialStatement(partial) {
                    this.acceptRequired(partial, 'name');
                    this.acceptArray(partial.params);
                    this.acceptKey(partial, 'hash');
                },
                ContentStatement: function ContentStatement() {
                },
                CommentStatement: function CommentStatement() {
                },
                SubExpression: function SubExpression(sexpr) {
                    this.acceptRequired(sexpr, 'path');
                    this.acceptArray(sexpr.params);
                    this.acceptKey(sexpr, 'hash');
                },
                PathExpression: function PathExpression() {
                },
                StringLiteral: function StringLiteral() {
                },
                NumberLiteral: function NumberLiteral() {
                },
                BooleanLiteral: function BooleanLiteral() {
                },
                UndefinedLiteral: function UndefinedLiteral() {
                },
                NullLiteral: function NullLiteral() {
                },
                Hash: function Hash(hash) {
                    this.acceptArray(hash.pairs);
                },
                HashPair: function HashPair(pair) {
                    this.acceptRequired(pair, 'value');
                }
            };
            exports['default'] = Visitor;
            module.exports = exports['default'];
        },
        function (module, exports, __webpack_require__) {
            (function (global) {
                'use strict';
                exports.__esModule = true;
                exports['default'] = function (Handlebars) {
                    var root = typeof global !== 'undefined' ? global : window, $Handlebars = root.Handlebars;
                    Handlebars.noConflict = function () {
                        if (root.Handlebars === Handlebars) {
                            root.Handlebars = $Handlebars;
                        }
                    };
                };
                module.exports = exports['default'];
            }.call(exports, function () {
                return this;
            }()));
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            exports['default'] = function (obj) {
                return obj && obj.__esModule ? obj : { 'default': obj };
            };
            exports.__esModule = true;
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            exports.HandlebarsEnvironment = HandlebarsEnvironment;
            exports.createFrame = createFrame;
            var _import = __webpack_require__(12);
            var Utils = _interopRequireWildcard(_import);
            var _Exception = __webpack_require__(11);
            var _Exception2 = _interopRequireWildcard(_Exception);
            var VERSION = '3.0.1';
            exports.VERSION = VERSION;
            var COMPILER_REVISION = 6;
            exports.COMPILER_REVISION = COMPILER_REVISION;
            var REVISION_CHANGES = {
                1: '<= 1.0.rc.2',
                2: '== 1.0.0-rc.3',
                3: '== 1.0.0-rc.4',
                4: '== 1.x.x',
                5: '== 2.0.0-alpha.x',
                6: '>= 2.0.0-beta.1'
            };
            exports.REVISION_CHANGES = REVISION_CHANGES;
            var isArray = Utils.isArray, isFunction = Utils.isFunction, toString = Utils.toString, objectType = '[object Object]';
            function HandlebarsEnvironment(helpers, partials) {
                this.helpers = helpers || {};
                this.partials = partials || {};
                registerDefaultHelpers(this);
            }
            HandlebarsEnvironment.prototype = {
                constructor: HandlebarsEnvironment,
                logger: logger,
                log: log,
                registerHelper: function registerHelper(name, fn) {
                    if (toString.call(name) === objectType) {
                        if (fn) {
                            throw new _Exception2['default']('Arg not supported with multiple helpers');
                        }
                        Utils.extend(this.helpers, name);
                    } else {
                        this.helpers[name] = fn;
                    }
                },
                unregisterHelper: function unregisterHelper(name) {
                    delete this.helpers[name];
                },
                registerPartial: function registerPartial(name, partial) {
                    if (toString.call(name) === objectType) {
                        Utils.extend(this.partials, name);
                    } else {
                        if (typeof partial === 'undefined') {
                            throw new _Exception2['default']('Attempting to register a partial as undefined');
                        }
                        this.partials[name] = partial;
                    }
                },
                unregisterPartial: function unregisterPartial(name) {
                    delete this.partials[name];
                }
            };
            function registerDefaultHelpers(instance) {
                instance.registerHelper('helperMissing', function () {
                    if (arguments.length === 1) {
                        return undefined;
                    } else {
                        throw new _Exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
                    }
                });
                instance.registerHelper('blockHelperMissing', function (context, options) {
                    var inverse = options.inverse, fn = options.fn;
                    if (context === true) {
                        return fn(this);
                    } else if (context === false || context == null) {
                        return inverse(this);
                    } else if (isArray(context)) {
                        if (context.length > 0) {
                            if (options.ids) {
                                options.ids = [options.name];
                            }
                            return instance.helpers.each(context, options);
                        } else {
                            return inverse(this);
                        }
                    } else {
                        if (options.data && options.ids) {
                            var data = createFrame(options.data);
                            data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
                            options = { data: data };
                        }
                        return fn(context, options);
                    }
                });
                instance.registerHelper('each', function (context, options) {
                    if (!options) {
                        throw new _Exception2['default']('Must pass iterator to #each');
                    }
                    var fn = options.fn, inverse = options.inverse, i = 0, ret = '', data = undefined, contextPath = undefined;
                    if (options.data && options.ids) {
                        contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
                    }
                    if (isFunction(context)) {
                        context = context.call(this);
                    }
                    if (options.data) {
                        data = createFrame(options.data);
                    }
                    function execIteration(field, index, last) {
                        if (data) {
                            data.key = field;
                            data.index = index;
                            data.first = index === 0;
                            data.last = !!last;
                            if (contextPath) {
                                data.contextPath = contextPath + field;
                            }
                        }
                        ret = ret + fn(context[field], {
                            data: data,
                            blockParams: Utils.blockParams([
                                context[field],
                                field
                            ], [
                                contextPath + field,
                                null
                            ])
                        });
                    }
                    if (context && typeof context === 'object') {
                        if (isArray(context)) {
                            for (var j = context.length; i < j; i++) {
                                execIteration(i, i, i === context.length - 1);
                            }
                        } else {
                            var priorKey = undefined;
                            for (var key in context) {
                                if (context.hasOwnProperty(key)) {
                                    if (priorKey) {
                                        execIteration(priorKey, i - 1);
                                    }
                                    priorKey = key;
                                    i++;
                                }
                            }
                            if (priorKey) {
                                execIteration(priorKey, i - 1, true);
                            }
                        }
                    }
                    if (i === 0) {
                        ret = inverse(this);
                    }
                    return ret;
                });
                instance.registerHelper('if', function (conditional, options) {
                    if (isFunction(conditional)) {
                        conditional = conditional.call(this);
                    }
                    if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
                        return options.inverse(this);
                    } else {
                        return options.fn(this);
                    }
                });
                instance.registerHelper('unless', function (conditional, options) {
                    return instance.helpers['if'].call(this, conditional, {
                        fn: options.inverse,
                        inverse: options.fn,
                        hash: options.hash
                    });
                });
                instance.registerHelper('with', function (context, options) {
                    if (isFunction(context)) {
                        context = context.call(this);
                    }
                    var fn = options.fn;
                    if (!Utils.isEmpty(context)) {
                        if (options.data && options.ids) {
                            var data = createFrame(options.data);
                            data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
                            options = { data: data };
                        }
                        return fn(context, options);
                    } else {
                        return options.inverse(this);
                    }
                });
                instance.registerHelper('log', function (message, options) {
                    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
                    instance.log(level, message);
                });
                instance.registerHelper('lookup', function (obj, field) {
                    return obj && obj[field];
                });
            }
            var logger = {
                methodMap: {
                    0: 'debug',
                    1: 'info',
                    2: 'warn',
                    3: 'error'
                },
                DEBUG: 0,
                INFO: 1,
                WARN: 2,
                ERROR: 3,
                level: 1,
                log: function log(level, message) {
                    if (typeof console !== 'undefined' && logger.level <= level) {
                        var method = logger.methodMap[level];
                        (console[method] || console.log).call(console, message);
                    }
                }
            };
            exports.logger = logger;
            var log = logger.log;
            exports.log = log;
            function createFrame(object) {
                var frame = Utils.extend({}, object);
                frame._parent = object;
                return frame;
            }
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            exports.__esModule = true;
            function SafeString(string) {
                this.string = string;
            }
            SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
                return '' + this.string;
            };
            exports['default'] = SafeString;
            module.exports = exports['default'];
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            exports.__esModule = true;
            var errorProps = [
                'description',
                'fileName',
                'lineNumber',
                'message',
                'name',
                'number',
                'stack'
            ];
            function Exception(message, node) {
                var loc = node && node.loc, line = undefined, column = undefined;
                if (loc) {
                    line = loc.start.line;
                    column = loc.start.column;
                    message += ' - ' + line + ':' + column;
                }
                var tmp = Error.prototype.constructor.call(this, message);
                for (var idx = 0; idx < errorProps.length; idx++) {
                    this[errorProps[idx]] = tmp[errorProps[idx]];
                }
                if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, Exception);
                }
                if (loc) {
                    this.lineNumber = line;
                    this.column = column;
                }
            }
            Exception.prototype = new Error();
            exports['default'] = Exception;
            module.exports = exports['default'];
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            exports.__esModule = true;
            exports.extend = extend;
            exports.indexOf = indexOf;
            exports.escapeExpression = escapeExpression;
            exports.isEmpty = isEmpty;
            exports.blockParams = blockParams;
            exports.appendContextPath = appendContextPath;
            var escape = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                '\'': '&#x27;',
                '`': '&#x60;'
            };
            var badChars = /[&<>"'`]/g, possible = /[&<>"'`]/;
            function escapeChar(chr) {
                return escape[chr];
            }
            function extend(obj) {
                for (var i = 1; i < arguments.length; i++) {
                    for (var key in arguments[i]) {
                        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
                            obj[key] = arguments[i][key];
                        }
                    }
                }
                return obj;
            }
            var toString = Object.prototype.toString;
            exports.toString = toString;
            var isFunction = function isFunction(value) {
                return typeof value === 'function';
            };
            if (isFunction(/x/)) {
                exports.isFunction = isFunction = function (value) {
                    return typeof value === 'function' && toString.call(value) === '[object Function]';
                };
            }
            var isFunction;
            exports.isFunction = isFunction;
            var isArray = Array.isArray || function (value) {
                return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
            };
            exports.isArray = isArray;
            function indexOf(array, value) {
                for (var i = 0, len = array.length; i < len; i++) {
                    if (array[i] === value) {
                        return i;
                    }
                }
                return -1;
            }
            function escapeExpression(string) {
                if (typeof string !== 'string') {
                    if (string && string.toHTML) {
                        return string.toHTML();
                    } else if (string == null) {
                        return '';
                    } else if (!string) {
                        return string + '';
                    }
                    string = '' + string;
                }
                if (!possible.test(string)) {
                    return string;
                }
                return string.replace(badChars, escapeChar);
            }
            function isEmpty(value) {
                if (!value && value !== 0) {
                    return true;
                } else if (isArray(value) && value.length === 0) {
                    return true;
                } else {
                    return false;
                }
            }
            function blockParams(params, ids) {
                params.path = ids;
                return params;
            }
            function appendContextPath(contextPath, id) {
                return (contextPath ? contextPath + '.' : '') + id;
            }
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            exports.checkRevision = checkRevision;
            exports.template = template;
            exports.wrapProgram = wrapProgram;
            exports.resolvePartial = resolvePartial;
            exports.invokePartial = invokePartial;
            exports.noop = noop;
            var _import = __webpack_require__(12);
            var Utils = _interopRequireWildcard(_import);
            var _Exception = __webpack_require__(11);
            var _Exception2 = _interopRequireWildcard(_Exception);
            var _COMPILER_REVISION$REVISION_CHANGES$createFrame = __webpack_require__(9);
            function checkRevision(compilerInfo) {
                var compilerRevision = compilerInfo && compilerInfo[0] || 1, currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;
                if (compilerRevision !== currentRevision) {
                    if (compilerRevision < currentRevision) {
                        var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision], compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];
                        throw new _Exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
                    } else {
                        throw new _Exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
                    }
                }
            }
            function template(templateSpec, env) {
                if (!env) {
                    throw new _Exception2['default']('No environment passed to template');
                }
                if (!templateSpec || !templateSpec.main) {
                    throw new _Exception2['default']('Unknown template object: ' + typeof templateSpec);
                }
                env.VM.checkRevision(templateSpec.compiler);
                function invokePartialWrapper(partial, context, options) {
                    if (options.hash) {
                        context = Utils.extend({}, context, options.hash);
                    }
                    partial = env.VM.resolvePartial.call(this, partial, context, options);
                    var result = env.VM.invokePartial.call(this, partial, context, options);
                    if (result == null && env.compile) {
                        options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
                        result = options.partials[options.name](context, options);
                    }
                    if (result != null) {
                        if (options.indent) {
                            var lines = result.split('\n');
                            for (var i = 0, l = lines.length; i < l; i++) {
                                if (!lines[i] && i + 1 === l) {
                                    break;
                                }
                                lines[i] = options.indent + lines[i];
                            }
                            result = lines.join('\n');
                        }
                        return result;
                    } else {
                        throw new _Exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
                    }
                }
                var container = {
                    strict: function strict(obj, name) {
                        if (!(name in obj)) {
                            throw new _Exception2['default']('"' + name + '" not defined in ' + obj);
                        }
                        return obj[name];
                    },
                    lookup: function lookup(depths, name) {
                        var len = depths.length;
                        for (var i = 0; i < len; i++) {
                            if (depths[i] && depths[i][name] != null) {
                                return depths[i][name];
                            }
                        }
                    },
                    lambda: function lambda(current, context) {
                        return typeof current === 'function' ? current.call(context) : current;
                    },
                    escapeExpression: Utils.escapeExpression,
                    invokePartial: invokePartialWrapper,
                    fn: function fn(i) {
                        return templateSpec[i];
                    },
                    programs: [],
                    program: function program(i, data, declaredBlockParams, blockParams, depths) {
                        var programWrapper = this.programs[i], fn = this.fn(i);
                        if (data || depths || blockParams || declaredBlockParams) {
                            programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
                        } else if (!programWrapper) {
                            programWrapper = this.programs[i] = wrapProgram(this, i, fn);
                        }
                        return programWrapper;
                    },
                    data: function data(value, depth) {
                        while (value && depth--) {
                            value = value._parent;
                        }
                        return value;
                    },
                    merge: function merge(param, common) {
                        var obj = param || common;
                        if (param && common && param !== common) {
                            obj = Utils.extend({}, common, param);
                        }
                        return obj;
                    },
                    noop: env.VM.noop,
                    compilerInfo: templateSpec.compiler
                };
                function ret(context) {
                    var options = arguments[1] === undefined ? {} : arguments[1];
                    var data = options.data;
                    ret._setup(options);
                    if (!options.partial && templateSpec.useData) {
                        data = initData(context, data);
                    }
                    var depths = undefined, blockParams = templateSpec.useBlockParams ? [] : undefined;
                    if (templateSpec.useDepths) {
                        depths = options.depths ? [context].concat(options.depths) : [context];
                    }
                    return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
                }
                ret.isTop = true;
                ret._setup = function (options) {
                    if (!options.partial) {
                        container.helpers = container.merge(options.helpers, env.helpers);
                        if (templateSpec.usePartial) {
                            container.partials = container.merge(options.partials, env.partials);
                        }
                    } else {
                        container.helpers = options.helpers;
                        container.partials = options.partials;
                    }
                };
                ret._child = function (i, data, blockParams, depths) {
                    if (templateSpec.useBlockParams && !blockParams) {
                        throw new _Exception2['default']('must pass block params');
                    }
                    if (templateSpec.useDepths && !depths) {
                        throw new _Exception2['default']('must pass parent depths');
                    }
                    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
                };
                return ret;
            }
            function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
                function prog(context) {
                    var options = arguments[1] === undefined ? {} : arguments[1];
                    return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), depths && [context].concat(depths));
                }
                prog.program = i;
                prog.depth = depths ? depths.length : 0;
                prog.blockParams = declaredBlockParams || 0;
                return prog;
            }
            function resolvePartial(partial, context, options) {
                if (!partial) {
                    partial = options.partials[options.name];
                } else if (!partial.call && !options.name) {
                    options.name = partial;
                    partial = options.partials[partial];
                }
                return partial;
            }
            function invokePartial(partial, context, options) {
                options.partial = true;
                if (partial === undefined) {
                    throw new _Exception2['default']('The partial ' + options.name + ' could not be found');
                } else if (partial instanceof Function) {
                    return partial(context, options);
                }
            }
            function noop() {
                return '';
            }
            function initData(context, data) {
                if (!data || !('root' in data)) {
                    data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};
                    data.root = context;
                }
                return data;
            }
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            exports.__esModule = true;
            var handlebars = function () {
                var parser = {
                    trace: function trace() {
                    },
                    yy: {},
                    symbols_: {
                        error: 2,
                        root: 3,
                        program: 4,
                        EOF: 5,
                        program_repetition0: 6,
                        statement: 7,
                        mustache: 8,
                        block: 9,
                        rawBlock: 10,
                        partial: 11,
                        content: 12,
                        COMMENT: 13,
                        CONTENT: 14,
                        openRawBlock: 15,
                        END_RAW_BLOCK: 16,
                        OPEN_RAW_BLOCK: 17,
                        helperName: 18,
                        openRawBlock_repetition0: 19,
                        openRawBlock_option0: 20,
                        CLOSE_RAW_BLOCK: 21,
                        openBlock: 22,
                        block_option0: 23,
                        closeBlock: 24,
                        openInverse: 25,
                        block_option1: 26,
                        OPEN_BLOCK: 27,
                        openBlock_repetition0: 28,
                        openBlock_option0: 29,
                        openBlock_option1: 30,
                        CLOSE: 31,
                        OPEN_INVERSE: 32,
                        openInverse_repetition0: 33,
                        openInverse_option0: 34,
                        openInverse_option1: 35,
                        openInverseChain: 36,
                        OPEN_INVERSE_CHAIN: 37,
                        openInverseChain_repetition0: 38,
                        openInverseChain_option0: 39,
                        openInverseChain_option1: 40,
                        inverseAndProgram: 41,
                        INVERSE: 42,
                        inverseChain: 43,
                        inverseChain_option0: 44,
                        OPEN_ENDBLOCK: 45,
                        OPEN: 46,
                        mustache_repetition0: 47,
                        mustache_option0: 48,
                        OPEN_UNESCAPED: 49,
                        mustache_repetition1: 50,
                        mustache_option1: 51,
                        CLOSE_UNESCAPED: 52,
                        OPEN_PARTIAL: 53,
                        partialName: 54,
                        partial_repetition0: 55,
                        partial_option0: 56,
                        param: 57,
                        sexpr: 58,
                        OPEN_SEXPR: 59,
                        sexpr_repetition0: 60,
                        sexpr_option0: 61,
                        CLOSE_SEXPR: 62,
                        hash: 63,
                        hash_repetition_plus0: 64,
                        hashSegment: 65,
                        ID: 66,
                        EQUALS: 67,
                        blockParams: 68,
                        OPEN_BLOCK_PARAMS: 69,
                        blockParams_repetition_plus0: 70,
                        CLOSE_BLOCK_PARAMS: 71,
                        path: 72,
                        dataName: 73,
                        STRING: 74,
                        NUMBER: 75,
                        BOOLEAN: 76,
                        UNDEFINED: 77,
                        NULL: 78,
                        DATA: 79,
                        pathSegments: 80,
                        SEP: 81,
                        $accept: 0,
                        $end: 1
                    },
                    terminals_: {
                        2: 'error',
                        5: 'EOF',
                        13: 'COMMENT',
                        14: 'CONTENT',
                        16: 'END_RAW_BLOCK',
                        17: 'OPEN_RAW_BLOCK',
                        21: 'CLOSE_RAW_BLOCK',
                        27: 'OPEN_BLOCK',
                        31: 'CLOSE',
                        32: 'OPEN_INVERSE',
                        37: 'OPEN_INVERSE_CHAIN',
                        42: 'INVERSE',
                        45: 'OPEN_ENDBLOCK',
                        46: 'OPEN',
                        49: 'OPEN_UNESCAPED',
                        52: 'CLOSE_UNESCAPED',
                        53: 'OPEN_PARTIAL',
                        59: 'OPEN_SEXPR',
                        62: 'CLOSE_SEXPR',
                        66: 'ID',
                        67: 'EQUALS',
                        69: 'OPEN_BLOCK_PARAMS',
                        71: 'CLOSE_BLOCK_PARAMS',
                        74: 'STRING',
                        75: 'NUMBER',
                        76: 'BOOLEAN',
                        77: 'UNDEFINED',
                        78: 'NULL',
                        79: 'DATA',
                        81: 'SEP'
                    },
                    productions_: [
                        0,
                        [
                            3,
                            2
                        ],
                        [
                            4,
                            1
                        ],
                        [
                            7,
                            1
                        ],
                        [
                            7,
                            1
                        ],
                        [
                            7,
                            1
                        ],
                        [
                            7,
                            1
                        ],
                        [
                            7,
                            1
                        ],
                        [
                            7,
                            1
                        ],
                        [
                            12,
                            1
                        ],
                        [
                            10,
                            3
                        ],
                        [
                            15,
                            5
                        ],
                        [
                            9,
                            4
                        ],
                        [
                            9,
                            4
                        ],
                        [
                            22,
                            6
                        ],
                        [
                            25,
                            6
                        ],
                        [
                            36,
                            6
                        ],
                        [
                            41,
                            2
                        ],
                        [
                            43,
                            3
                        ],
                        [
                            43,
                            1
                        ],
                        [
                            24,
                            3
                        ],
                        [
                            8,
                            5
                        ],
                        [
                            8,
                            5
                        ],
                        [
                            11,
                            5
                        ],
                        [
                            57,
                            1
                        ],
                        [
                            57,
                            1
                        ],
                        [
                            58,
                            5
                        ],
                        [
                            63,
                            1
                        ],
                        [
                            65,
                            3
                        ],
                        [
                            68,
                            3
                        ],
                        [
                            18,
                            1
                        ],
                        [
                            18,
                            1
                        ],
                        [
                            18,
                            1
                        ],
                        [
                            18,
                            1
                        ],
                        [
                            18,
                            1
                        ],
                        [
                            18,
                            1
                        ],
                        [
                            18,
                            1
                        ],
                        [
                            54,
                            1
                        ],
                        [
                            54,
                            1
                        ],
                        [
                            73,
                            2
                        ],
                        [
                            72,
                            1
                        ],
                        [
                            80,
                            3
                        ],
                        [
                            80,
                            1
                        ],
                        [
                            6,
                            0
                        ],
                        [
                            6,
                            2
                        ],
                        [
                            19,
                            0
                        ],
                        [
                            19,
                            2
                        ],
                        [
                            20,
                            0
                        ],
                        [
                            20,
                            1
                        ],
                        [
                            23,
                            0
                        ],
                        [
                            23,
                            1
                        ],
                        [
                            26,
                            0
                        ],
                        [
                            26,
                            1
                        ],
                        [
                            28,
                            0
                        ],
                        [
                            28,
                            2
                        ],
                        [
                            29,
                            0
                        ],
                        [
                            29,
                            1
                        ],
                        [
                            30,
                            0
                        ],
                        [
                            30,
                            1
                        ],
                        [
                            33,
                            0
                        ],
                        [
                            33,
                            2
                        ],
                        [
                            34,
                            0
                        ],
                        [
                            34,
                            1
                        ],
                        [
                            35,
                            0
                        ],
                        [
                            35,
                            1
                        ],
                        [
                            38,
                            0
                        ],
                        [
                            38,
                            2
                        ],
                        [
                            39,
                            0
                        ],
                        [
                            39,
                            1
                        ],
                        [
                            40,
                            0
                        ],
                        [
                            40,
                            1
                        ],
                        [
                            44,
                            0
                        ],
                        [
                            44,
                            1
                        ],
                        [
                            47,
                            0
                        ],
                        [
                            47,
                            2
                        ],
                        [
                            48,
                            0
                        ],
                        [
                            48,
                            1
                        ],
                        [
                            50,
                            0
                        ],
                        [
                            50,
                            2
                        ],
                        [
                            51,
                            0
                        ],
                        [
                            51,
                            1
                        ],
                        [
                            55,
                            0
                        ],
                        [
                            55,
                            2
                        ],
                        [
                            56,
                            0
                        ],
                        [
                            56,
                            1
                        ],
                        [
                            60,
                            0
                        ],
                        [
                            60,
                            2
                        ],
                        [
                            61,
                            0
                        ],
                        [
                            61,
                            1
                        ],
                        [
                            64,
                            1
                        ],
                        [
                            64,
                            2
                        ],
                        [
                            70,
                            1
                        ],
                        [
                            70,
                            2
                        ]
                    ],
                    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
                        var $0 = $$.length - 1;
                        switch (yystate) {
                        case 1:
                            return $$[$0 - 1];
                            break;
                        case 2:
                            this.$ = new yy.Program($$[$0], null, {}, yy.locInfo(this._$));
                            break;
                        case 3:
                            this.$ = $$[$0];
                            break;
                        case 4:
                            this.$ = $$[$0];
                            break;
                        case 5:
                            this.$ = $$[$0];
                            break;
                        case 6:
                            this.$ = $$[$0];
                            break;
                        case 7:
                            this.$ = $$[$0];
                            break;
                        case 8:
                            this.$ = new yy.CommentStatement(yy.stripComment($$[$0]), yy.stripFlags($$[$0], $$[$0]), yy.locInfo(this._$));
                            break;
                        case 9:
                            this.$ = new yy.ContentStatement($$[$0], yy.locInfo(this._$));
                            break;
                        case 10:
                            this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                            break;
                        case 11:
                            this.$ = {
                                path: $$[$0 - 3],
                                params: $$[$0 - 2],
                                hash: $$[$0 - 1]
                            };
                            break;
                        case 12:
                            this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
                            break;
                        case 13:
                            this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
                            break;
                        case 14:
                            this.$ = {
                                path: $$[$0 - 4],
                                params: $$[$0 - 3],
                                hash: $$[$0 - 2],
                                blockParams: $$[$0 - 1],
                                strip: yy.stripFlags($$[$0 - 5], $$[$0])
                            };
                            break;
                        case 15:
                            this.$ = {
                                path: $$[$0 - 4],
                                params: $$[$0 - 3],
                                hash: $$[$0 - 2],
                                blockParams: $$[$0 - 1],
                                strip: yy.stripFlags($$[$0 - 5], $$[$0])
                            };
                            break;
                        case 16:
                            this.$ = {
                                path: $$[$0 - 4],
                                params: $$[$0 - 3],
                                hash: $$[$0 - 2],
                                blockParams: $$[$0 - 1],
                                strip: yy.stripFlags($$[$0 - 5], $$[$0])
                            };
                            break;
                        case 17:
                            this.$ = {
                                strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]),
                                program: $$[$0]
                            };
                            break;
                        case 18:
                            var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$), program = new yy.Program([inverse], null, {}, yy.locInfo(this._$));
                            program.chained = true;
                            this.$ = {
                                strip: $$[$0 - 2].strip,
                                program: program,
                                chain: true
                            };
                            break;
                        case 19:
                            this.$ = $$[$0];
                            break;
                        case 20:
                            this.$ = {
                                path: $$[$0 - 1],
                                strip: yy.stripFlags($$[$0 - 2], $$[$0])
                            };
                            break;
                        case 21:
                            this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                            break;
                        case 22:
                            this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                            break;
                        case 23:
                            this.$ = new yy.PartialStatement($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.stripFlags($$[$0 - 4], $$[$0]), yy.locInfo(this._$));
                            break;
                        case 24:
                            this.$ = $$[$0];
                            break;
                        case 25:
                            this.$ = $$[$0];
                            break;
                        case 26:
                            this.$ = new yy.SubExpression($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.locInfo(this._$));
                            break;
                        case 27:
                            this.$ = new yy.Hash($$[$0], yy.locInfo(this._$));
                            break;
                        case 28:
                            this.$ = new yy.HashPair(yy.id($$[$0 - 2]), $$[$0], yy.locInfo(this._$));
                            break;
                        case 29:
                            this.$ = yy.id($$[$0 - 1]);
                            break;
                        case 30:
                            this.$ = $$[$0];
                            break;
                        case 31:
                            this.$ = $$[$0];
                            break;
                        case 32:
                            this.$ = new yy.StringLiteral($$[$0], yy.locInfo(this._$));
                            break;
                        case 33:
                            this.$ = new yy.NumberLiteral($$[$0], yy.locInfo(this._$));
                            break;
                        case 34:
                            this.$ = new yy.BooleanLiteral($$[$0], yy.locInfo(this._$));
                            break;
                        case 35:
                            this.$ = new yy.UndefinedLiteral(yy.locInfo(this._$));
                            break;
                        case 36:
                            this.$ = new yy.NullLiteral(yy.locInfo(this._$));
                            break;
                        case 37:
                            this.$ = $$[$0];
                            break;
                        case 38:
                            this.$ = $$[$0];
                            break;
                        case 39:
                            this.$ = yy.preparePath(true, $$[$0], this._$);
                            break;
                        case 40:
                            this.$ = yy.preparePath(false, $$[$0], this._$);
                            break;
                        case 41:
                            $$[$0 - 2].push({
                                part: yy.id($$[$0]),
                                original: $$[$0],
                                separator: $$[$0 - 1]
                            });
                            this.$ = $$[$0 - 2];
                            break;
                        case 42:
                            this.$ = [{
                                    part: yy.id($$[$0]),
                                    original: $$[$0]
                                }];
                            break;
                        case 43:
                            this.$ = [];
                            break;
                        case 44:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 45:
                            this.$ = [];
                            break;
                        case 46:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 53:
                            this.$ = [];
                            break;
                        case 54:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 59:
                            this.$ = [];
                            break;
                        case 60:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 65:
                            this.$ = [];
                            break;
                        case 66:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 73:
                            this.$ = [];
                            break;
                        case 74:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 77:
                            this.$ = [];
                            break;
                        case 78:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 81:
                            this.$ = [];
                            break;
                        case 82:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 85:
                            this.$ = [];
                            break;
                        case 86:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 89:
                            this.$ = [$$[$0]];
                            break;
                        case 90:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        case 91:
                            this.$ = [$$[$0]];
                            break;
                        case 92:
                            $$[$0 - 1].push($$[$0]);
                            break;
                        }
                    },
                    table: [
                        {
                            3: 1,
                            4: 2,
                            5: [
                                2,
                                43
                            ],
                            6: 3,
                            13: [
                                2,
                                43
                            ],
                            14: [
                                2,
                                43
                            ],
                            17: [
                                2,
                                43
                            ],
                            27: [
                                2,
                                43
                            ],
                            32: [
                                2,
                                43
                            ],
                            46: [
                                2,
                                43
                            ],
                            49: [
                                2,
                                43
                            ],
                            53: [
                                2,
                                43
                            ]
                        },
                        { 1: [3] },
                        {
                            5: [
                                1,
                                4
                            ]
                        },
                        {
                            5: [
                                2,
                                2
                            ],
                            7: 5,
                            8: 6,
                            9: 7,
                            10: 8,
                            11: 9,
                            12: 10,
                            13: [
                                1,
                                11
                            ],
                            14: [
                                1,
                                18
                            ],
                            15: 16,
                            17: [
                                1,
                                21
                            ],
                            22: 14,
                            25: 15,
                            27: [
                                1,
                                19
                            ],
                            32: [
                                1,
                                20
                            ],
                            37: [
                                2,
                                2
                            ],
                            42: [
                                2,
                                2
                            ],
                            45: [
                                2,
                                2
                            ],
                            46: [
                                1,
                                12
                            ],
                            49: [
                                1,
                                13
                            ],
                            53: [
                                1,
                                17
                            ]
                        },
                        {
                            1: [
                                2,
                                1
                            ]
                        },
                        {
                            5: [
                                2,
                                44
                            ],
                            13: [
                                2,
                                44
                            ],
                            14: [
                                2,
                                44
                            ],
                            17: [
                                2,
                                44
                            ],
                            27: [
                                2,
                                44
                            ],
                            32: [
                                2,
                                44
                            ],
                            37: [
                                2,
                                44
                            ],
                            42: [
                                2,
                                44
                            ],
                            45: [
                                2,
                                44
                            ],
                            46: [
                                2,
                                44
                            ],
                            49: [
                                2,
                                44
                            ],
                            53: [
                                2,
                                44
                            ]
                        },
                        {
                            5: [
                                2,
                                3
                            ],
                            13: [
                                2,
                                3
                            ],
                            14: [
                                2,
                                3
                            ],
                            17: [
                                2,
                                3
                            ],
                            27: [
                                2,
                                3
                            ],
                            32: [
                                2,
                                3
                            ],
                            37: [
                                2,
                                3
                            ],
                            42: [
                                2,
                                3
                            ],
                            45: [
                                2,
                                3
                            ],
                            46: [
                                2,
                                3
                            ],
                            49: [
                                2,
                                3
                            ],
                            53: [
                                2,
                                3
                            ]
                        },
                        {
                            5: [
                                2,
                                4
                            ],
                            13: [
                                2,
                                4
                            ],
                            14: [
                                2,
                                4
                            ],
                            17: [
                                2,
                                4
                            ],
                            27: [
                                2,
                                4
                            ],
                            32: [
                                2,
                                4
                            ],
                            37: [
                                2,
                                4
                            ],
                            42: [
                                2,
                                4
                            ],
                            45: [
                                2,
                                4
                            ],
                            46: [
                                2,
                                4
                            ],
                            49: [
                                2,
                                4
                            ],
                            53: [
                                2,
                                4
                            ]
                        },
                        {
                            5: [
                                2,
                                5
                            ],
                            13: [
                                2,
                                5
                            ],
                            14: [
                                2,
                                5
                            ],
                            17: [
                                2,
                                5
                            ],
                            27: [
                                2,
                                5
                            ],
                            32: [
                                2,
                                5
                            ],
                            37: [
                                2,
                                5
                            ],
                            42: [
                                2,
                                5
                            ],
                            45: [
                                2,
                                5
                            ],
                            46: [
                                2,
                                5
                            ],
                            49: [
                                2,
                                5
                            ],
                            53: [
                                2,
                                5
                            ]
                        },
                        {
                            5: [
                                2,
                                6
                            ],
                            13: [
                                2,
                                6
                            ],
                            14: [
                                2,
                                6
                            ],
                            17: [
                                2,
                                6
                            ],
                            27: [
                                2,
                                6
                            ],
                            32: [
                                2,
                                6
                            ],
                            37: [
                                2,
                                6
                            ],
                            42: [
                                2,
                                6
                            ],
                            45: [
                                2,
                                6
                            ],
                            46: [
                                2,
                                6
                            ],
                            49: [
                                2,
                                6
                            ],
                            53: [
                                2,
                                6
                            ]
                        },
                        {
                            5: [
                                2,
                                7
                            ],
                            13: [
                                2,
                                7
                            ],
                            14: [
                                2,
                                7
                            ],
                            17: [
                                2,
                                7
                            ],
                            27: [
                                2,
                                7
                            ],
                            32: [
                                2,
                                7
                            ],
                            37: [
                                2,
                                7
                            ],
                            42: [
                                2,
                                7
                            ],
                            45: [
                                2,
                                7
                            ],
                            46: [
                                2,
                                7
                            ],
                            49: [
                                2,
                                7
                            ],
                            53: [
                                2,
                                7
                            ]
                        },
                        {
                            5: [
                                2,
                                8
                            ],
                            13: [
                                2,
                                8
                            ],
                            14: [
                                2,
                                8
                            ],
                            17: [
                                2,
                                8
                            ],
                            27: [
                                2,
                                8
                            ],
                            32: [
                                2,
                                8
                            ],
                            37: [
                                2,
                                8
                            ],
                            42: [
                                2,
                                8
                            ],
                            45: [
                                2,
                                8
                            ],
                            46: [
                                2,
                                8
                            ],
                            49: [
                                2,
                                8
                            ],
                            53: [
                                2,
                                8
                            ]
                        },
                        {
                            18: 22,
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            18: 33,
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            4: 34,
                            6: 3,
                            13: [
                                2,
                                43
                            ],
                            14: [
                                2,
                                43
                            ],
                            17: [
                                2,
                                43
                            ],
                            27: [
                                2,
                                43
                            ],
                            32: [
                                2,
                                43
                            ],
                            37: [
                                2,
                                43
                            ],
                            42: [
                                2,
                                43
                            ],
                            45: [
                                2,
                                43
                            ],
                            46: [
                                2,
                                43
                            ],
                            49: [
                                2,
                                43
                            ],
                            53: [
                                2,
                                43
                            ]
                        },
                        {
                            4: 35,
                            6: 3,
                            13: [
                                2,
                                43
                            ],
                            14: [
                                2,
                                43
                            ],
                            17: [
                                2,
                                43
                            ],
                            27: [
                                2,
                                43
                            ],
                            32: [
                                2,
                                43
                            ],
                            42: [
                                2,
                                43
                            ],
                            45: [
                                2,
                                43
                            ],
                            46: [
                                2,
                                43
                            ],
                            49: [
                                2,
                                43
                            ],
                            53: [
                                2,
                                43
                            ]
                        },
                        {
                            12: 36,
                            14: [
                                1,
                                18
                            ]
                        },
                        {
                            18: 38,
                            54: 37,
                            58: 39,
                            59: [
                                1,
                                40
                            ],
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            5: [
                                2,
                                9
                            ],
                            13: [
                                2,
                                9
                            ],
                            14: [
                                2,
                                9
                            ],
                            16: [
                                2,
                                9
                            ],
                            17: [
                                2,
                                9
                            ],
                            27: [
                                2,
                                9
                            ],
                            32: [
                                2,
                                9
                            ],
                            37: [
                                2,
                                9
                            ],
                            42: [
                                2,
                                9
                            ],
                            45: [
                                2,
                                9
                            ],
                            46: [
                                2,
                                9
                            ],
                            49: [
                                2,
                                9
                            ],
                            53: [
                                2,
                                9
                            ]
                        },
                        {
                            18: 41,
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            18: 42,
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            18: 43,
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            31: [
                                2,
                                73
                            ],
                            47: 44,
                            59: [
                                2,
                                73
                            ],
                            66: [
                                2,
                                73
                            ],
                            74: [
                                2,
                                73
                            ],
                            75: [
                                2,
                                73
                            ],
                            76: [
                                2,
                                73
                            ],
                            77: [
                                2,
                                73
                            ],
                            78: [
                                2,
                                73
                            ],
                            79: [
                                2,
                                73
                            ]
                        },
                        {
                            21: [
                                2,
                                30
                            ],
                            31: [
                                2,
                                30
                            ],
                            52: [
                                2,
                                30
                            ],
                            59: [
                                2,
                                30
                            ],
                            62: [
                                2,
                                30
                            ],
                            66: [
                                2,
                                30
                            ],
                            69: [
                                2,
                                30
                            ],
                            74: [
                                2,
                                30
                            ],
                            75: [
                                2,
                                30
                            ],
                            76: [
                                2,
                                30
                            ],
                            77: [
                                2,
                                30
                            ],
                            78: [
                                2,
                                30
                            ],
                            79: [
                                2,
                                30
                            ]
                        },
                        {
                            21: [
                                2,
                                31
                            ],
                            31: [
                                2,
                                31
                            ],
                            52: [
                                2,
                                31
                            ],
                            59: [
                                2,
                                31
                            ],
                            62: [
                                2,
                                31
                            ],
                            66: [
                                2,
                                31
                            ],
                            69: [
                                2,
                                31
                            ],
                            74: [
                                2,
                                31
                            ],
                            75: [
                                2,
                                31
                            ],
                            76: [
                                2,
                                31
                            ],
                            77: [
                                2,
                                31
                            ],
                            78: [
                                2,
                                31
                            ],
                            79: [
                                2,
                                31
                            ]
                        },
                        {
                            21: [
                                2,
                                32
                            ],
                            31: [
                                2,
                                32
                            ],
                            52: [
                                2,
                                32
                            ],
                            59: [
                                2,
                                32
                            ],
                            62: [
                                2,
                                32
                            ],
                            66: [
                                2,
                                32
                            ],
                            69: [
                                2,
                                32
                            ],
                            74: [
                                2,
                                32
                            ],
                            75: [
                                2,
                                32
                            ],
                            76: [
                                2,
                                32
                            ],
                            77: [
                                2,
                                32
                            ],
                            78: [
                                2,
                                32
                            ],
                            79: [
                                2,
                                32
                            ]
                        },
                        {
                            21: [
                                2,
                                33
                            ],
                            31: [
                                2,
                                33
                            ],
                            52: [
                                2,
                                33
                            ],
                            59: [
                                2,
                                33
                            ],
                            62: [
                                2,
                                33
                            ],
                            66: [
                                2,
                                33
                            ],
                            69: [
                                2,
                                33
                            ],
                            74: [
                                2,
                                33
                            ],
                            75: [
                                2,
                                33
                            ],
                            76: [
                                2,
                                33
                            ],
                            77: [
                                2,
                                33
                            ],
                            78: [
                                2,
                                33
                            ],
                            79: [
                                2,
                                33
                            ]
                        },
                        {
                            21: [
                                2,
                                34
                            ],
                            31: [
                                2,
                                34
                            ],
                            52: [
                                2,
                                34
                            ],
                            59: [
                                2,
                                34
                            ],
                            62: [
                                2,
                                34
                            ],
                            66: [
                                2,
                                34
                            ],
                            69: [
                                2,
                                34
                            ],
                            74: [
                                2,
                                34
                            ],
                            75: [
                                2,
                                34
                            ],
                            76: [
                                2,
                                34
                            ],
                            77: [
                                2,
                                34
                            ],
                            78: [
                                2,
                                34
                            ],
                            79: [
                                2,
                                34
                            ]
                        },
                        {
                            21: [
                                2,
                                35
                            ],
                            31: [
                                2,
                                35
                            ],
                            52: [
                                2,
                                35
                            ],
                            59: [
                                2,
                                35
                            ],
                            62: [
                                2,
                                35
                            ],
                            66: [
                                2,
                                35
                            ],
                            69: [
                                2,
                                35
                            ],
                            74: [
                                2,
                                35
                            ],
                            75: [
                                2,
                                35
                            ],
                            76: [
                                2,
                                35
                            ],
                            77: [
                                2,
                                35
                            ],
                            78: [
                                2,
                                35
                            ],
                            79: [
                                2,
                                35
                            ]
                        },
                        {
                            21: [
                                2,
                                36
                            ],
                            31: [
                                2,
                                36
                            ],
                            52: [
                                2,
                                36
                            ],
                            59: [
                                2,
                                36
                            ],
                            62: [
                                2,
                                36
                            ],
                            66: [
                                2,
                                36
                            ],
                            69: [
                                2,
                                36
                            ],
                            74: [
                                2,
                                36
                            ],
                            75: [
                                2,
                                36
                            ],
                            76: [
                                2,
                                36
                            ],
                            77: [
                                2,
                                36
                            ],
                            78: [
                                2,
                                36
                            ],
                            79: [
                                2,
                                36
                            ]
                        },
                        {
                            21: [
                                2,
                                40
                            ],
                            31: [
                                2,
                                40
                            ],
                            52: [
                                2,
                                40
                            ],
                            59: [
                                2,
                                40
                            ],
                            62: [
                                2,
                                40
                            ],
                            66: [
                                2,
                                40
                            ],
                            69: [
                                2,
                                40
                            ],
                            74: [
                                2,
                                40
                            ],
                            75: [
                                2,
                                40
                            ],
                            76: [
                                2,
                                40
                            ],
                            77: [
                                2,
                                40
                            ],
                            78: [
                                2,
                                40
                            ],
                            79: [
                                2,
                                40
                            ],
                            81: [
                                1,
                                45
                            ]
                        },
                        {
                            66: [
                                1,
                                32
                            ],
                            80: 46
                        },
                        {
                            21: [
                                2,
                                42
                            ],
                            31: [
                                2,
                                42
                            ],
                            52: [
                                2,
                                42
                            ],
                            59: [
                                2,
                                42
                            ],
                            62: [
                                2,
                                42
                            ],
                            66: [
                                2,
                                42
                            ],
                            69: [
                                2,
                                42
                            ],
                            74: [
                                2,
                                42
                            ],
                            75: [
                                2,
                                42
                            ],
                            76: [
                                2,
                                42
                            ],
                            77: [
                                2,
                                42
                            ],
                            78: [
                                2,
                                42
                            ],
                            79: [
                                2,
                                42
                            ],
                            81: [
                                2,
                                42
                            ]
                        },
                        {
                            50: 47,
                            52: [
                                2,
                                77
                            ],
                            59: [
                                2,
                                77
                            ],
                            66: [
                                2,
                                77
                            ],
                            74: [
                                2,
                                77
                            ],
                            75: [
                                2,
                                77
                            ],
                            76: [
                                2,
                                77
                            ],
                            77: [
                                2,
                                77
                            ],
                            78: [
                                2,
                                77
                            ],
                            79: [
                                2,
                                77
                            ]
                        },
                        {
                            23: 48,
                            36: 50,
                            37: [
                                1,
                                52
                            ],
                            41: 51,
                            42: [
                                1,
                                53
                            ],
                            43: 49,
                            45: [
                                2,
                                49
                            ]
                        },
                        {
                            26: 54,
                            41: 55,
                            42: [
                                1,
                                53
                            ],
                            45: [
                                2,
                                51
                            ]
                        },
                        {
                            16: [
                                1,
                                56
                            ]
                        },
                        {
                            31: [
                                2,
                                81
                            ],
                            55: 57,
                            59: [
                                2,
                                81
                            ],
                            66: [
                                2,
                                81
                            ],
                            74: [
                                2,
                                81
                            ],
                            75: [
                                2,
                                81
                            ],
                            76: [
                                2,
                                81
                            ],
                            77: [
                                2,
                                81
                            ],
                            78: [
                                2,
                                81
                            ],
                            79: [
                                2,
                                81
                            ]
                        },
                        {
                            31: [
                                2,
                                37
                            ],
                            59: [
                                2,
                                37
                            ],
                            66: [
                                2,
                                37
                            ],
                            74: [
                                2,
                                37
                            ],
                            75: [
                                2,
                                37
                            ],
                            76: [
                                2,
                                37
                            ],
                            77: [
                                2,
                                37
                            ],
                            78: [
                                2,
                                37
                            ],
                            79: [
                                2,
                                37
                            ]
                        },
                        {
                            31: [
                                2,
                                38
                            ],
                            59: [
                                2,
                                38
                            ],
                            66: [
                                2,
                                38
                            ],
                            74: [
                                2,
                                38
                            ],
                            75: [
                                2,
                                38
                            ],
                            76: [
                                2,
                                38
                            ],
                            77: [
                                2,
                                38
                            ],
                            78: [
                                2,
                                38
                            ],
                            79: [
                                2,
                                38
                            ]
                        },
                        {
                            18: 58,
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            28: 59,
                            31: [
                                2,
                                53
                            ],
                            59: [
                                2,
                                53
                            ],
                            66: [
                                2,
                                53
                            ],
                            69: [
                                2,
                                53
                            ],
                            74: [
                                2,
                                53
                            ],
                            75: [
                                2,
                                53
                            ],
                            76: [
                                2,
                                53
                            ],
                            77: [
                                2,
                                53
                            ],
                            78: [
                                2,
                                53
                            ],
                            79: [
                                2,
                                53
                            ]
                        },
                        {
                            31: [
                                2,
                                59
                            ],
                            33: 60,
                            59: [
                                2,
                                59
                            ],
                            66: [
                                2,
                                59
                            ],
                            69: [
                                2,
                                59
                            ],
                            74: [
                                2,
                                59
                            ],
                            75: [
                                2,
                                59
                            ],
                            76: [
                                2,
                                59
                            ],
                            77: [
                                2,
                                59
                            ],
                            78: [
                                2,
                                59
                            ],
                            79: [
                                2,
                                59
                            ]
                        },
                        {
                            19: 61,
                            21: [
                                2,
                                45
                            ],
                            59: [
                                2,
                                45
                            ],
                            66: [
                                2,
                                45
                            ],
                            74: [
                                2,
                                45
                            ],
                            75: [
                                2,
                                45
                            ],
                            76: [
                                2,
                                45
                            ],
                            77: [
                                2,
                                45
                            ],
                            78: [
                                2,
                                45
                            ],
                            79: [
                                2,
                                45
                            ]
                        },
                        {
                            18: 65,
                            31: [
                                2,
                                75
                            ],
                            48: 62,
                            57: 63,
                            58: 66,
                            59: [
                                1,
                                40
                            ],
                            63: 64,
                            64: 67,
                            65: 68,
                            66: [
                                1,
                                69
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            66: [
                                1,
                                70
                            ]
                        },
                        {
                            21: [
                                2,
                                39
                            ],
                            31: [
                                2,
                                39
                            ],
                            52: [
                                2,
                                39
                            ],
                            59: [
                                2,
                                39
                            ],
                            62: [
                                2,
                                39
                            ],
                            66: [
                                2,
                                39
                            ],
                            69: [
                                2,
                                39
                            ],
                            74: [
                                2,
                                39
                            ],
                            75: [
                                2,
                                39
                            ],
                            76: [
                                2,
                                39
                            ],
                            77: [
                                2,
                                39
                            ],
                            78: [
                                2,
                                39
                            ],
                            79: [
                                2,
                                39
                            ],
                            81: [
                                1,
                                45
                            ]
                        },
                        {
                            18: 65,
                            51: 71,
                            52: [
                                2,
                                79
                            ],
                            57: 72,
                            58: 66,
                            59: [
                                1,
                                40
                            ],
                            63: 73,
                            64: 67,
                            65: 68,
                            66: [
                                1,
                                69
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            24: 74,
                            45: [
                                1,
                                75
                            ]
                        },
                        {
                            45: [
                                2,
                                50
                            ]
                        },
                        {
                            4: 76,
                            6: 3,
                            13: [
                                2,
                                43
                            ],
                            14: [
                                2,
                                43
                            ],
                            17: [
                                2,
                                43
                            ],
                            27: [
                                2,
                                43
                            ],
                            32: [
                                2,
                                43
                            ],
                            37: [
                                2,
                                43
                            ],
                            42: [
                                2,
                                43
                            ],
                            45: [
                                2,
                                43
                            ],
                            46: [
                                2,
                                43
                            ],
                            49: [
                                2,
                                43
                            ],
                            53: [
                                2,
                                43
                            ]
                        },
                        {
                            45: [
                                2,
                                19
                            ]
                        },
                        {
                            18: 77,
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            4: 78,
                            6: 3,
                            13: [
                                2,
                                43
                            ],
                            14: [
                                2,
                                43
                            ],
                            17: [
                                2,
                                43
                            ],
                            27: [
                                2,
                                43
                            ],
                            32: [
                                2,
                                43
                            ],
                            45: [
                                2,
                                43
                            ],
                            46: [
                                2,
                                43
                            ],
                            49: [
                                2,
                                43
                            ],
                            53: [
                                2,
                                43
                            ]
                        },
                        {
                            24: 79,
                            45: [
                                1,
                                75
                            ]
                        },
                        {
                            45: [
                                2,
                                52
                            ]
                        },
                        {
                            5: [
                                2,
                                10
                            ],
                            13: [
                                2,
                                10
                            ],
                            14: [
                                2,
                                10
                            ],
                            17: [
                                2,
                                10
                            ],
                            27: [
                                2,
                                10
                            ],
                            32: [
                                2,
                                10
                            ],
                            37: [
                                2,
                                10
                            ],
                            42: [
                                2,
                                10
                            ],
                            45: [
                                2,
                                10
                            ],
                            46: [
                                2,
                                10
                            ],
                            49: [
                                2,
                                10
                            ],
                            53: [
                                2,
                                10
                            ]
                        },
                        {
                            18: 65,
                            31: [
                                2,
                                83
                            ],
                            56: 80,
                            57: 81,
                            58: 66,
                            59: [
                                1,
                                40
                            ],
                            63: 82,
                            64: 67,
                            65: 68,
                            66: [
                                1,
                                69
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            59: [
                                2,
                                85
                            ],
                            60: 83,
                            62: [
                                2,
                                85
                            ],
                            66: [
                                2,
                                85
                            ],
                            74: [
                                2,
                                85
                            ],
                            75: [
                                2,
                                85
                            ],
                            76: [
                                2,
                                85
                            ],
                            77: [
                                2,
                                85
                            ],
                            78: [
                                2,
                                85
                            ],
                            79: [
                                2,
                                85
                            ]
                        },
                        {
                            18: 65,
                            29: 84,
                            31: [
                                2,
                                55
                            ],
                            57: 85,
                            58: 66,
                            59: [
                                1,
                                40
                            ],
                            63: 86,
                            64: 67,
                            65: 68,
                            66: [
                                1,
                                69
                            ],
                            69: [
                                2,
                                55
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            18: 65,
                            31: [
                                2,
                                61
                            ],
                            34: 87,
                            57: 88,
                            58: 66,
                            59: [
                                1,
                                40
                            ],
                            63: 89,
                            64: 67,
                            65: 68,
                            66: [
                                1,
                                69
                            ],
                            69: [
                                2,
                                61
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            18: 65,
                            20: 90,
                            21: [
                                2,
                                47
                            ],
                            57: 91,
                            58: 66,
                            59: [
                                1,
                                40
                            ],
                            63: 92,
                            64: 67,
                            65: 68,
                            66: [
                                1,
                                69
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            31: [
                                1,
                                93
                            ]
                        },
                        {
                            31: [
                                2,
                                74
                            ],
                            59: [
                                2,
                                74
                            ],
                            66: [
                                2,
                                74
                            ],
                            74: [
                                2,
                                74
                            ],
                            75: [
                                2,
                                74
                            ],
                            76: [
                                2,
                                74
                            ],
                            77: [
                                2,
                                74
                            ],
                            78: [
                                2,
                                74
                            ],
                            79: [
                                2,
                                74
                            ]
                        },
                        {
                            31: [
                                2,
                                76
                            ]
                        },
                        {
                            21: [
                                2,
                                24
                            ],
                            31: [
                                2,
                                24
                            ],
                            52: [
                                2,
                                24
                            ],
                            59: [
                                2,
                                24
                            ],
                            62: [
                                2,
                                24
                            ],
                            66: [
                                2,
                                24
                            ],
                            69: [
                                2,
                                24
                            ],
                            74: [
                                2,
                                24
                            ],
                            75: [
                                2,
                                24
                            ],
                            76: [
                                2,
                                24
                            ],
                            77: [
                                2,
                                24
                            ],
                            78: [
                                2,
                                24
                            ],
                            79: [
                                2,
                                24
                            ]
                        },
                        {
                            21: [
                                2,
                                25
                            ],
                            31: [
                                2,
                                25
                            ],
                            52: [
                                2,
                                25
                            ],
                            59: [
                                2,
                                25
                            ],
                            62: [
                                2,
                                25
                            ],
                            66: [
                                2,
                                25
                            ],
                            69: [
                                2,
                                25
                            ],
                            74: [
                                2,
                                25
                            ],
                            75: [
                                2,
                                25
                            ],
                            76: [
                                2,
                                25
                            ],
                            77: [
                                2,
                                25
                            ],
                            78: [
                                2,
                                25
                            ],
                            79: [
                                2,
                                25
                            ]
                        },
                        {
                            21: [
                                2,
                                27
                            ],
                            31: [
                                2,
                                27
                            ],
                            52: [
                                2,
                                27
                            ],
                            62: [
                                2,
                                27
                            ],
                            65: 94,
                            66: [
                                1,
                                95
                            ],
                            69: [
                                2,
                                27
                            ]
                        },
                        {
                            21: [
                                2,
                                89
                            ],
                            31: [
                                2,
                                89
                            ],
                            52: [
                                2,
                                89
                            ],
                            62: [
                                2,
                                89
                            ],
                            66: [
                                2,
                                89
                            ],
                            69: [
                                2,
                                89
                            ]
                        },
                        {
                            21: [
                                2,
                                42
                            ],
                            31: [
                                2,
                                42
                            ],
                            52: [
                                2,
                                42
                            ],
                            59: [
                                2,
                                42
                            ],
                            62: [
                                2,
                                42
                            ],
                            66: [
                                2,
                                42
                            ],
                            67: [
                                1,
                                96
                            ],
                            69: [
                                2,
                                42
                            ],
                            74: [
                                2,
                                42
                            ],
                            75: [
                                2,
                                42
                            ],
                            76: [
                                2,
                                42
                            ],
                            77: [
                                2,
                                42
                            ],
                            78: [
                                2,
                                42
                            ],
                            79: [
                                2,
                                42
                            ],
                            81: [
                                2,
                                42
                            ]
                        },
                        {
                            21: [
                                2,
                                41
                            ],
                            31: [
                                2,
                                41
                            ],
                            52: [
                                2,
                                41
                            ],
                            59: [
                                2,
                                41
                            ],
                            62: [
                                2,
                                41
                            ],
                            66: [
                                2,
                                41
                            ],
                            69: [
                                2,
                                41
                            ],
                            74: [
                                2,
                                41
                            ],
                            75: [
                                2,
                                41
                            ],
                            76: [
                                2,
                                41
                            ],
                            77: [
                                2,
                                41
                            ],
                            78: [
                                2,
                                41
                            ],
                            79: [
                                2,
                                41
                            ],
                            81: [
                                2,
                                41
                            ]
                        },
                        {
                            52: [
                                1,
                                97
                            ]
                        },
                        {
                            52: [
                                2,
                                78
                            ],
                            59: [
                                2,
                                78
                            ],
                            66: [
                                2,
                                78
                            ],
                            74: [
                                2,
                                78
                            ],
                            75: [
                                2,
                                78
                            ],
                            76: [
                                2,
                                78
                            ],
                            77: [
                                2,
                                78
                            ],
                            78: [
                                2,
                                78
                            ],
                            79: [
                                2,
                                78
                            ]
                        },
                        {
                            52: [
                                2,
                                80
                            ]
                        },
                        {
                            5: [
                                2,
                                12
                            ],
                            13: [
                                2,
                                12
                            ],
                            14: [
                                2,
                                12
                            ],
                            17: [
                                2,
                                12
                            ],
                            27: [
                                2,
                                12
                            ],
                            32: [
                                2,
                                12
                            ],
                            37: [
                                2,
                                12
                            ],
                            42: [
                                2,
                                12
                            ],
                            45: [
                                2,
                                12
                            ],
                            46: [
                                2,
                                12
                            ],
                            49: [
                                2,
                                12
                            ],
                            53: [
                                2,
                                12
                            ]
                        },
                        {
                            18: 98,
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            36: 50,
                            37: [
                                1,
                                52
                            ],
                            41: 51,
                            42: [
                                1,
                                53
                            ],
                            43: 100,
                            44: 99,
                            45: [
                                2,
                                71
                            ]
                        },
                        {
                            31: [
                                2,
                                65
                            ],
                            38: 101,
                            59: [
                                2,
                                65
                            ],
                            66: [
                                2,
                                65
                            ],
                            69: [
                                2,
                                65
                            ],
                            74: [
                                2,
                                65
                            ],
                            75: [
                                2,
                                65
                            ],
                            76: [
                                2,
                                65
                            ],
                            77: [
                                2,
                                65
                            ],
                            78: [
                                2,
                                65
                            ],
                            79: [
                                2,
                                65
                            ]
                        },
                        {
                            45: [
                                2,
                                17
                            ]
                        },
                        {
                            5: [
                                2,
                                13
                            ],
                            13: [
                                2,
                                13
                            ],
                            14: [
                                2,
                                13
                            ],
                            17: [
                                2,
                                13
                            ],
                            27: [
                                2,
                                13
                            ],
                            32: [
                                2,
                                13
                            ],
                            37: [
                                2,
                                13
                            ],
                            42: [
                                2,
                                13
                            ],
                            45: [
                                2,
                                13
                            ],
                            46: [
                                2,
                                13
                            ],
                            49: [
                                2,
                                13
                            ],
                            53: [
                                2,
                                13
                            ]
                        },
                        {
                            31: [
                                1,
                                102
                            ]
                        },
                        {
                            31: [
                                2,
                                82
                            ],
                            59: [
                                2,
                                82
                            ],
                            66: [
                                2,
                                82
                            ],
                            74: [
                                2,
                                82
                            ],
                            75: [
                                2,
                                82
                            ],
                            76: [
                                2,
                                82
                            ],
                            77: [
                                2,
                                82
                            ],
                            78: [
                                2,
                                82
                            ],
                            79: [
                                2,
                                82
                            ]
                        },
                        {
                            31: [
                                2,
                                84
                            ]
                        },
                        {
                            18: 65,
                            57: 104,
                            58: 66,
                            59: [
                                1,
                                40
                            ],
                            61: 103,
                            62: [
                                2,
                                87
                            ],
                            63: 105,
                            64: 67,
                            65: 68,
                            66: [
                                1,
                                69
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            30: 106,
                            31: [
                                2,
                                57
                            ],
                            68: 107,
                            69: [
                                1,
                                108
                            ]
                        },
                        {
                            31: [
                                2,
                                54
                            ],
                            59: [
                                2,
                                54
                            ],
                            66: [
                                2,
                                54
                            ],
                            69: [
                                2,
                                54
                            ],
                            74: [
                                2,
                                54
                            ],
                            75: [
                                2,
                                54
                            ],
                            76: [
                                2,
                                54
                            ],
                            77: [
                                2,
                                54
                            ],
                            78: [
                                2,
                                54
                            ],
                            79: [
                                2,
                                54
                            ]
                        },
                        {
                            31: [
                                2,
                                56
                            ],
                            69: [
                                2,
                                56
                            ]
                        },
                        {
                            31: [
                                2,
                                63
                            ],
                            35: 109,
                            68: 110,
                            69: [
                                1,
                                108
                            ]
                        },
                        {
                            31: [
                                2,
                                60
                            ],
                            59: [
                                2,
                                60
                            ],
                            66: [
                                2,
                                60
                            ],
                            69: [
                                2,
                                60
                            ],
                            74: [
                                2,
                                60
                            ],
                            75: [
                                2,
                                60
                            ],
                            76: [
                                2,
                                60
                            ],
                            77: [
                                2,
                                60
                            ],
                            78: [
                                2,
                                60
                            ],
                            79: [
                                2,
                                60
                            ]
                        },
                        {
                            31: [
                                2,
                                62
                            ],
                            69: [
                                2,
                                62
                            ]
                        },
                        {
                            21: [
                                1,
                                111
                            ]
                        },
                        {
                            21: [
                                2,
                                46
                            ],
                            59: [
                                2,
                                46
                            ],
                            66: [
                                2,
                                46
                            ],
                            74: [
                                2,
                                46
                            ],
                            75: [
                                2,
                                46
                            ],
                            76: [
                                2,
                                46
                            ],
                            77: [
                                2,
                                46
                            ],
                            78: [
                                2,
                                46
                            ],
                            79: [
                                2,
                                46
                            ]
                        },
                        {
                            21: [
                                2,
                                48
                            ]
                        },
                        {
                            5: [
                                2,
                                21
                            ],
                            13: [
                                2,
                                21
                            ],
                            14: [
                                2,
                                21
                            ],
                            17: [
                                2,
                                21
                            ],
                            27: [
                                2,
                                21
                            ],
                            32: [
                                2,
                                21
                            ],
                            37: [
                                2,
                                21
                            ],
                            42: [
                                2,
                                21
                            ],
                            45: [
                                2,
                                21
                            ],
                            46: [
                                2,
                                21
                            ],
                            49: [
                                2,
                                21
                            ],
                            53: [
                                2,
                                21
                            ]
                        },
                        {
                            21: [
                                2,
                                90
                            ],
                            31: [
                                2,
                                90
                            ],
                            52: [
                                2,
                                90
                            ],
                            62: [
                                2,
                                90
                            ],
                            66: [
                                2,
                                90
                            ],
                            69: [
                                2,
                                90
                            ]
                        },
                        {
                            67: [
                                1,
                                96
                            ]
                        },
                        {
                            18: 65,
                            57: 112,
                            58: 66,
                            59: [
                                1,
                                40
                            ],
                            66: [
                                1,
                                32
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            5: [
                                2,
                                22
                            ],
                            13: [
                                2,
                                22
                            ],
                            14: [
                                2,
                                22
                            ],
                            17: [
                                2,
                                22
                            ],
                            27: [
                                2,
                                22
                            ],
                            32: [
                                2,
                                22
                            ],
                            37: [
                                2,
                                22
                            ],
                            42: [
                                2,
                                22
                            ],
                            45: [
                                2,
                                22
                            ],
                            46: [
                                2,
                                22
                            ],
                            49: [
                                2,
                                22
                            ],
                            53: [
                                2,
                                22
                            ]
                        },
                        {
                            31: [
                                1,
                                113
                            ]
                        },
                        {
                            45: [
                                2,
                                18
                            ]
                        },
                        {
                            45: [
                                2,
                                72
                            ]
                        },
                        {
                            18: 65,
                            31: [
                                2,
                                67
                            ],
                            39: 114,
                            57: 115,
                            58: 66,
                            59: [
                                1,
                                40
                            ],
                            63: 116,
                            64: 67,
                            65: 68,
                            66: [
                                1,
                                69
                            ],
                            69: [
                                2,
                                67
                            ],
                            72: 23,
                            73: 24,
                            74: [
                                1,
                                25
                            ],
                            75: [
                                1,
                                26
                            ],
                            76: [
                                1,
                                27
                            ],
                            77: [
                                1,
                                28
                            ],
                            78: [
                                1,
                                29
                            ],
                            79: [
                                1,
                                31
                            ],
                            80: 30
                        },
                        {
                            5: [
                                2,
                                23
                            ],
                            13: [
                                2,
                                23
                            ],
                            14: [
                                2,
                                23
                            ],
                            17: [
                                2,
                                23
                            ],
                            27: [
                                2,
                                23
                            ],
                            32: [
                                2,
                                23
                            ],
                            37: [
                                2,
                                23
                            ],
                            42: [
                                2,
                                23
                            ],
                            45: [
                                2,
                                23
                            ],
                            46: [
                                2,
                                23
                            ],
                            49: [
                                2,
                                23
                            ],
                            53: [
                                2,
                                23
                            ]
                        },
                        {
                            62: [
                                1,
                                117
                            ]
                        },
                        {
                            59: [
                                2,
                                86
                            ],
                            62: [
                                2,
                                86
                            ],
                            66: [
                                2,
                                86
                            ],
                            74: [
                                2,
                                86
                            ],
                            75: [
                                2,
                                86
                            ],
                            76: [
                                2,
                                86
                            ],
                            77: [
                                2,
                                86
                            ],
                            78: [
                                2,
                                86
                            ],
                            79: [
                                2,
                                86
                            ]
                        },
                        {
                            62: [
                                2,
                                88
                            ]
                        },
                        {
                            31: [
                                1,
                                118
                            ]
                        },
                        {
                            31: [
                                2,
                                58
                            ]
                        },
                        {
                            66: [
                                1,
                                120
                            ],
                            70: 119
                        },
                        {
                            31: [
                                1,
                                121
                            ]
                        },
                        {
                            31: [
                                2,
                                64
                            ]
                        },
                        {
                            14: [
                                2,
                                11
                            ]
                        },
                        {
                            21: [
                                2,
                                28
                            ],
                            31: [
                                2,
                                28
                            ],
                            52: [
                                2,
                                28
                            ],
                            62: [
                                2,
                                28
                            ],
                            66: [
                                2,
                                28
                            ],
                            69: [
                                2,
                                28
                            ]
                        },
                        {
                            5: [
                                2,
                                20
                            ],
                            13: [
                                2,
                                20
                            ],
                            14: [
                                2,
                                20
                            ],
                            17: [
                                2,
                                20
                            ],
                            27: [
                                2,
                                20
                            ],
                            32: [
                                2,
                                20
                            ],
                            37: [
                                2,
                                20
                            ],
                            42: [
                                2,
                                20
                            ],
                            45: [
                                2,
                                20
                            ],
                            46: [
                                2,
                                20
                            ],
                            49: [
                                2,
                                20
                            ],
                            53: [
                                2,
                                20
                            ]
                        },
                        {
                            31: [
                                2,
                                69
                            ],
                            40: 122,
                            68: 123,
                            69: [
                                1,
                                108
                            ]
                        },
                        {
                            31: [
                                2,
                                66
                            ],
                            59: [
                                2,
                                66
                            ],
                            66: [
                                2,
                                66
                            ],
                            69: [
                                2,
                                66
                            ],
                            74: [
                                2,
                                66
                            ],
                            75: [
                                2,
                                66
                            ],
                            76: [
                                2,
                                66
                            ],
                            77: [
                                2,
                                66
                            ],
                            78: [
                                2,
                                66
                            ],
                            79: [
                                2,
                                66
                            ]
                        },
                        {
                            31: [
                                2,
                                68
                            ],
                            69: [
                                2,
                                68
                            ]
                        },
                        {
                            21: [
                                2,
                                26
                            ],
                            31: [
                                2,
                                26
                            ],
                            52: [
                                2,
                                26
                            ],
                            59: [
                                2,
                                26
                            ],
                            62: [
                                2,
                                26
                            ],
                            66: [
                                2,
                                26
                            ],
                            69: [
                                2,
                                26
                            ],
                            74: [
                                2,
                                26
                            ],
                            75: [
                                2,
                                26
                            ],
                            76: [
                                2,
                                26
                            ],
                            77: [
                                2,
                                26
                            ],
                            78: [
                                2,
                                26
                            ],
                            79: [
                                2,
                                26
                            ]
                        },
                        {
                            13: [
                                2,
                                14
                            ],
                            14: [
                                2,
                                14
                            ],
                            17: [
                                2,
                                14
                            ],
                            27: [
                                2,
                                14
                            ],
                            32: [
                                2,
                                14
                            ],
                            37: [
                                2,
                                14
                            ],
                            42: [
                                2,
                                14
                            ],
                            45: [
                                2,
                                14
                            ],
                            46: [
                                2,
                                14
                            ],
                            49: [
                                2,
                                14
                            ],
                            53: [
                                2,
                                14
                            ]
                        },
                        {
                            66: [
                                1,
                                125
                            ],
                            71: [
                                1,
                                124
                            ]
                        },
                        {
                            66: [
                                2,
                                91
                            ],
                            71: [
                                2,
                                91
                            ]
                        },
                        {
                            13: [
                                2,
                                15
                            ],
                            14: [
                                2,
                                15
                            ],
                            17: [
                                2,
                                15
                            ],
                            27: [
                                2,
                                15
                            ],
                            32: [
                                2,
                                15
                            ],
                            42: [
                                2,
                                15
                            ],
                            45: [
                                2,
                                15
                            ],
                            46: [
                                2,
                                15
                            ],
                            49: [
                                2,
                                15
                            ],
                            53: [
                                2,
                                15
                            ]
                        },
                        {
                            31: [
                                1,
                                126
                            ]
                        },
                        {
                            31: [
                                2,
                                70
                            ]
                        },
                        {
                            31: [
                                2,
                                29
                            ]
                        },
                        {
                            66: [
                                2,
                                92
                            ],
                            71: [
                                2,
                                92
                            ]
                        },
                        {
                            13: [
                                2,
                                16
                            ],
                            14: [
                                2,
                                16
                            ],
                            17: [
                                2,
                                16
                            ],
                            27: [
                                2,
                                16
                            ],
                            32: [
                                2,
                                16
                            ],
                            37: [
                                2,
                                16
                            ],
                            42: [
                                2,
                                16
                            ],
                            45: [
                                2,
                                16
                            ],
                            46: [
                                2,
                                16
                            ],
                            49: [
                                2,
                                16
                            ],
                            53: [
                                2,
                                16
                            ]
                        }
                    ],
                    defaultActions: {
                        4: [
                            2,
                            1
                        ],
                        49: [
                            2,
                            50
                        ],
                        51: [
                            2,
                            19
                        ],
                        55: [
                            2,
                            52
                        ],
                        64: [
                            2,
                            76
                        ],
                        73: [
                            2,
                            80
                        ],
                        78: [
                            2,
                            17
                        ],
                        82: [
                            2,
                            84
                        ],
                        92: [
                            2,
                            48
                        ],
                        99: [
                            2,
                            18
                        ],
                        100: [
                            2,
                            72
                        ],
                        105: [
                            2,
                            88
                        ],
                        107: [
                            2,
                            58
                        ],
                        110: [
                            2,
                            64
                        ],
                        111: [
                            2,
                            11
                        ],
                        123: [
                            2,
                            70
                        ],
                        124: [
                            2,
                            29
                        ]
                    },
                    parseError: function parseError(str, hash) {
                        throw new Error(str);
                    },
                    parse: function parse(input) {
                        var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
                        this.lexer.setInput(input);
                        this.lexer.yy = this.yy;
                        this.yy.lexer = this.lexer;
                        this.yy.parser = this;
                        if (typeof this.lexer.yylloc == 'undefined')
                            this.lexer.yylloc = {};
                        var yyloc = this.lexer.yylloc;
                        lstack.push(yyloc);
                        var ranges = this.lexer.options && this.lexer.options.ranges;
                        if (typeof this.yy.parseError === 'function')
                            this.parseError = this.yy.parseError;
                        function popStack(n) {
                            stack.length = stack.length - 2 * n;
                            vstack.length = vstack.length - n;
                            lstack.length = lstack.length - n;
                        }
                        function lex() {
                            var token;
                            token = self.lexer.lex() || 1;
                            if (typeof token !== 'number') {
                                token = self.symbols_[token] || token;
                            }
                            return token;
                        }
                        var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
                        while (true) {
                            state = stack[stack.length - 1];
                            if (this.defaultActions[state]) {
                                action = this.defaultActions[state];
                            } else {
                                if (symbol === null || typeof symbol == 'undefined') {
                                    symbol = lex();
                                }
                                action = table[state] && table[state][symbol];
                            }
                            if (typeof action === 'undefined' || !action.length || !action[0]) {
                                var errStr = '';
                                if (!recovering) {
                                    expected = [];
                                    for (p in table[state])
                                        if (this.terminals_[p] && p > 2) {
                                            expected.push('\'' + this.terminals_[p] + '\'');
                                        }
                                    if (this.lexer.showPosition) {
                                        errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                                    } else {
                                        errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == 1 ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                                    }
                                    this.parseError(errStr, {
                                        text: this.lexer.match,
                                        token: this.terminals_[symbol] || symbol,
                                        line: this.lexer.yylineno,
                                        loc: yyloc,
                                        expected: expected
                                    });
                                }
                            }
                            if (action[0] instanceof Array && action.length > 1) {
                                throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
                            }
                            switch (action[0]) {
                            case 1:
                                stack.push(symbol);
                                vstack.push(this.lexer.yytext);
                                lstack.push(this.lexer.yylloc);
                                stack.push(action[1]);
                                symbol = null;
                                if (!preErrorSymbol) {
                                    yyleng = this.lexer.yyleng;
                                    yytext = this.lexer.yytext;
                                    yylineno = this.lexer.yylineno;
                                    yyloc = this.lexer.yylloc;
                                    if (recovering > 0)
                                        recovering--;
                                } else {
                                    symbol = preErrorSymbol;
                                    preErrorSymbol = null;
                                }
                                break;
                            case 2:
                                len = this.productions_[action[1]][1];
                                yyval.$ = vstack[vstack.length - len];
                                yyval._$ = {
                                    first_line: lstack[lstack.length - (len || 1)].first_line,
                                    last_line: lstack[lstack.length - 1].last_line,
                                    first_column: lstack[lstack.length - (len || 1)].first_column,
                                    last_column: lstack[lstack.length - 1].last_column
                                };
                                if (ranges) {
                                    yyval._$.range = [
                                        lstack[lstack.length - (len || 1)].range[0],
                                        lstack[lstack.length - 1].range[1]
                                    ];
                                }
                                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                                if (typeof r !== 'undefined') {
                                    return r;
                                }
                                if (len) {
                                    stack = stack.slice(0, -1 * len * 2);
                                    vstack = vstack.slice(0, -1 * len);
                                    lstack = lstack.slice(0, -1 * len);
                                }
                                stack.push(this.productions_[action[1]][0]);
                                vstack.push(yyval.$);
                                lstack.push(yyval._$);
                                newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                                stack.push(newState);
                                break;
                            case 3:
                                return true;
                            }
                        }
                        return true;
                    }
                };
                var lexer = function () {
                    var lexer = {
                        EOF: 1,
                        parseError: function parseError(str, hash) {
                            if (this.yy.parser) {
                                this.yy.parser.parseError(str, hash);
                            } else {
                                throw new Error(str);
                            }
                        },
                        setInput: function setInput(input) {
                            this._input = input;
                            this._more = this._less = this.done = false;
                            this.yylineno = this.yyleng = 0;
                            this.yytext = this.matched = this.match = '';
                            this.conditionStack = ['INITIAL'];
                            this.yylloc = {
                                first_line: 1,
                                first_column: 0,
                                last_line: 1,
                                last_column: 0
                            };
                            if (this.options.ranges)
                                this.yylloc.range = [
                                    0,
                                    0
                                ];
                            this.offset = 0;
                            return this;
                        },
                        input: function input() {
                            var ch = this._input[0];
                            this.yytext += ch;
                            this.yyleng++;
                            this.offset++;
                            this.match += ch;
                            this.matched += ch;
                            var lines = ch.match(/(?:\r\n?|\n).*/g);
                            if (lines) {
                                this.yylineno++;
                                this.yylloc.last_line++;
                            } else {
                                this.yylloc.last_column++;
                            }
                            if (this.options.ranges)
                                this.yylloc.range[1]++;
                            this._input = this._input.slice(1);
                            return ch;
                        },
                        unput: function unput(ch) {
                            var len = ch.length;
                            var lines = ch.split(/(?:\r\n?|\n)/g);
                            this._input = ch + this._input;
                            this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
                            this.offset -= len;
                            var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                            this.match = this.match.substr(0, this.match.length - 1);
                            this.matched = this.matched.substr(0, this.matched.length - 1);
                            if (lines.length - 1)
                                this.yylineno -= lines.length - 1;
                            var r = this.yylloc.range;
                            this.yylloc = {
                                first_line: this.yylloc.first_line,
                                last_line: this.yylineno + 1,
                                first_column: this.yylloc.first_column,
                                last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
                            };
                            if (this.options.ranges) {
                                this.yylloc.range = [
                                    r[0],
                                    r[0] + this.yyleng - len
                                ];
                            }
                            return this;
                        },
                        more: function more() {
                            this._more = true;
                            return this;
                        },
                        less: function less(n) {
                            this.unput(this.match.slice(n));
                        },
                        pastInput: function pastInput() {
                            var past = this.matched.substr(0, this.matched.length - this.match.length);
                            return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, '');
                        },
                        upcomingInput: function upcomingInput() {
                            var next = this.match;
                            if (next.length < 20) {
                                next += this._input.substr(0, 20 - next.length);
                            }
                            return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, '');
                        },
                        showPosition: function showPosition() {
                            var pre = this.pastInput();
                            var c = new Array(pre.length + 1).join('-');
                            return pre + this.upcomingInput() + '\n' + c + '^';
                        },
                        next: function next() {
                            if (this.done) {
                                return this.EOF;
                            }
                            if (!this._input)
                                this.done = true;
                            var token, match, tempMatch, index, col, lines;
                            if (!this._more) {
                                this.yytext = '';
                                this.match = '';
                            }
                            var rules = this._currentRules();
                            for (var i = 0; i < rules.length; i++) {
                                tempMatch = this._input.match(this.rules[rules[i]]);
                                if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                                    match = tempMatch;
                                    index = i;
                                    if (!this.options.flex)
                                        break;
                                }
                            }
                            if (match) {
                                lines = match[0].match(/(?:\r\n?|\n).*/g);
                                if (lines)
                                    this.yylineno += lines.length;
                                this.yylloc = {
                                    first_line: this.yylloc.last_line,
                                    last_line: this.yylineno + 1,
                                    first_column: this.yylloc.last_column,
                                    last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
                                };
                                this.yytext += match[0];
                                this.match += match[0];
                                this.matches = match;
                                this.yyleng = this.yytext.length;
                                if (this.options.ranges) {
                                    this.yylloc.range = [
                                        this.offset,
                                        this.offset += this.yyleng
                                    ];
                                }
                                this._more = false;
                                this._input = this._input.slice(match[0].length);
                                this.matched += match[0];
                                token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
                                if (this.done && this._input)
                                    this.done = false;
                                if (token) {
                                    return token;
                                } else {
                                    return;
                                }
                            }
                            if (this._input === '') {
                                return this.EOF;
                            } else {
                                return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                                    text: '',
                                    token: null,
                                    line: this.yylineno
                                });
                            }
                        },
                        lex: function lex() {
                            var r = this.next();
                            if (typeof r !== 'undefined') {
                                return r;
                            } else {
                                return this.lex();
                            }
                        },
                        begin: function begin(condition) {
                            this.conditionStack.push(condition);
                        },
                        popState: function popState() {
                            return this.conditionStack.pop();
                        },
                        _currentRules: function _currentRules() {
                            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
                        },
                        topState: function topState() {
                            return this.conditionStack[this.conditionStack.length - 2];
                        },
                        pushState: function begin(condition) {
                            this.begin(condition);
                        }
                    };
                    lexer.options = {};
                    lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
                        function strip(start, end) {
                            return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
                        }
                        var YYSTATE = YY_START;
                        switch ($avoiding_name_collisions) {
                        case 0:
                            if (yy_.yytext.slice(-2) === '\\\\') {
                                strip(0, 1);
                                this.begin('mu');
                            } else if (yy_.yytext.slice(-1) === '\\') {
                                strip(0, 1);
                                this.begin('emu');
                            } else {
                                this.begin('mu');
                            }
                            if (yy_.yytext) {
                                return 14;
                            }
                            break;
                        case 1:
                            return 14;
                            break;
                        case 2:
                            this.popState();
                            return 14;
                            break;
                        case 3:
                            yy_.yytext = yy_.yytext.substr(5, yy_.yyleng - 9);
                            this.popState();
                            return 16;
                            break;
                        case 4:
                            return 14;
                            break;
                        case 5:
                            this.popState();
                            return 13;
                            break;
                        case 6:
                            return 59;
                            break;
                        case 7:
                            return 62;
                            break;
                        case 8:
                            return 17;
                            break;
                        case 9:
                            this.popState();
                            this.begin('raw');
                            return 21;
                            break;
                        case 10:
                            return 53;
                            break;
                        case 11:
                            return 27;
                            break;
                        case 12:
                            return 45;
                            break;
                        case 13:
                            this.popState();
                            return 42;
                            break;
                        case 14:
                            this.popState();
                            return 42;
                            break;
                        case 15:
                            return 32;
                            break;
                        case 16:
                            return 37;
                            break;
                        case 17:
                            return 49;
                            break;
                        case 18:
                            return 46;
                            break;
                        case 19:
                            this.unput(yy_.yytext);
                            this.popState();
                            this.begin('com');
                            break;
                        case 20:
                            this.popState();
                            return 13;
                            break;
                        case 21:
                            return 46;
                            break;
                        case 22:
                            return 67;
                            break;
                        case 23:
                            return 66;
                            break;
                        case 24:
                            return 66;
                            break;
                        case 25:
                            return 81;
                            break;
                        case 26:
                            break;
                        case 27:
                            this.popState();
                            return 52;
                            break;
                        case 28:
                            this.popState();
                            return 31;
                            break;
                        case 29:
                            yy_.yytext = strip(1, 2).replace(/\\"/g, '"');
                            return 74;
                            break;
                        case 30:
                            yy_.yytext = strip(1, 2).replace(/\\'/g, '\'');
                            return 74;
                            break;
                        case 31:
                            return 79;
                            break;
                        case 32:
                            return 76;
                            break;
                        case 33:
                            return 76;
                            break;
                        case 34:
                            return 77;
                            break;
                        case 35:
                            return 78;
                            break;
                        case 36:
                            return 75;
                            break;
                        case 37:
                            return 69;
                            break;
                        case 38:
                            return 71;
                            break;
                        case 39:
                            return 66;
                            break;
                        case 40:
                            return 66;
                            break;
                        case 41:
                            return 'INVALID';
                            break;
                        case 42:
                            return 5;
                            break;
                        }
                    };
                    lexer.rules = [
                        /^(?:[^\x00]*?(?=(\{\{)))/,
                        /^(?:[^\x00]+)/,
                        /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,
                        /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,
                        /^(?:[^\x00]*?(?=(\{\{\{\{\/)))/,
                        /^(?:[\s\S]*?--(~)?\}\})/,
                        /^(?:\()/,
                        /^(?:\))/,
                        /^(?:\{\{\{\{)/,
                        /^(?:\}\}\}\})/,
                        /^(?:\{\{(~)?>)/,
                        /^(?:\{\{(~)?#)/,
                        /^(?:\{\{(~)?\/)/,
                        /^(?:\{\{(~)?\^\s*(~)?\}\})/,
                        /^(?:\{\{(~)?\s*else\s*(~)?\}\})/,
                        /^(?:\{\{(~)?\^)/,
                        /^(?:\{\{(~)?\s*else\b)/,
                        /^(?:\{\{(~)?\{)/,
                        /^(?:\{\{(~)?&)/,
                        /^(?:\{\{(~)?!--)/,
                        /^(?:\{\{(~)?![\s\S]*?\}\})/,
                        /^(?:\{\{(~)?)/,
                        /^(?:=)/,
                        /^(?:\.\.)/,
                        /^(?:\.(?=([=~}\s\/.)|])))/,
                        /^(?:[\/.])/,
                        /^(?:\s+)/,
                        /^(?:\}(~)?\}\})/,
                        /^(?:(~)?\}\})/,
                        /^(?:"(\\["]|[^"])*")/,
                        /^(?:'(\\[']|[^'])*')/,
                        /^(?:@)/,
                        /^(?:true(?=([~}\s)])))/,
                        /^(?:false(?=([~}\s)])))/,
                        /^(?:undefined(?=([~}\s)])))/,
                        /^(?:null(?=([~}\s)])))/,
                        /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,
                        /^(?:as\s+\|)/,
                        /^(?:\|)/,
                        /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/,
                        /^(?:\[[^\]]*\])/,
                        /^(?:.)/,
                        /^(?:$)/
                    ];
                    lexer.conditions = {
                        mu: {
                            rules: [
                                6,
                                7,
                                8,
                                9,
                                10,
                                11,
                                12,
                                13,
                                14,
                                15,
                                16,
                                17,
                                18,
                                19,
                                20,
                                21,
                                22,
                                23,
                                24,
                                25,
                                26,
                                27,
                                28,
                                29,
                                30,
                                31,
                                32,
                                33,
                                34,
                                35,
                                36,
                                37,
                                38,
                                39,
                                40,
                                41,
                                42
                            ],
                            inclusive: false
                        },
                        emu: {
                            rules: [2],
                            inclusive: false
                        },
                        com: {
                            rules: [5],
                            inclusive: false
                        },
                        raw: {
                            rules: [
                                3,
                                4
                            ],
                            inclusive: false
                        },
                        INITIAL: {
                            rules: [
                                0,
                                1,
                                42
                            ],
                            inclusive: true
                        }
                    };
                    return lexer;
                }();
                parser.lexer = lexer;
                function Parser() {
                    this.yy = {};
                }
                Parser.prototype = parser;
                parser.Parser = Parser;
                return new Parser();
            }();
            exports['default'] = handlebars;
            module.exports = exports['default'];
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            var _Visitor = __webpack_require__(6);
            var _Visitor2 = _interopRequireWildcard(_Visitor);
            function WhitespaceControl() {
            }
            WhitespaceControl.prototype = new _Visitor2['default']();
            WhitespaceControl.prototype.Program = function (program) {
                var isRoot = !this.isRootSeen;
                this.isRootSeen = true;
                var body = program.body;
                for (var i = 0, l = body.length; i < l; i++) {
                    var current = body[i], strip = this.accept(current);
                    if (!strip) {
                        continue;
                    }
                    var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot), _isNextWhitespace = isNextWhitespace(body, i, isRoot), openStandalone = strip.openStandalone && _isPrevWhitespace, closeStandalone = strip.closeStandalone && _isNextWhitespace, inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;
                    if (strip.close) {
                        omitRight(body, i, true);
                    }
                    if (strip.open) {
                        omitLeft(body, i, true);
                    }
                    if (inlineStandalone) {
                        omitRight(body, i);
                        if (omitLeft(body, i)) {
                            if (current.type === 'PartialStatement') {
                                current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
                            }
                        }
                    }
                    if (openStandalone) {
                        omitRight((current.program || current.inverse).body);
                        omitLeft(body, i);
                    }
                    if (closeStandalone) {
                        omitRight(body, i);
                        omitLeft((current.inverse || current.program).body);
                    }
                }
                return program;
            };
            WhitespaceControl.prototype.BlockStatement = function (block) {
                this.accept(block.program);
                this.accept(block.inverse);
                var program = block.program || block.inverse, inverse = block.program && block.inverse, firstInverse = inverse, lastInverse = inverse;
                if (inverse && inverse.chained) {
                    firstInverse = inverse.body[0].program;
                    while (lastInverse.chained) {
                        lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
                    }
                }
                var strip = {
                    open: block.openStrip.open,
                    close: block.closeStrip.close,
                    openStandalone: isNextWhitespace(program.body),
                    closeStandalone: isPrevWhitespace((firstInverse || program).body)
                };
                if (block.openStrip.close) {
                    omitRight(program.body, null, true);
                }
                if (inverse) {
                    var inverseStrip = block.inverseStrip;
                    if (inverseStrip.open) {
                        omitLeft(program.body, null, true);
                    }
                    if (inverseStrip.close) {
                        omitRight(firstInverse.body, null, true);
                    }
                    if (block.closeStrip.open) {
                        omitLeft(lastInverse.body, null, true);
                    }
                    if (isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
                        omitLeft(program.body);
                        omitRight(firstInverse.body);
                    }
                } else if (block.closeStrip.open) {
                    omitLeft(program.body, null, true);
                }
                return strip;
            };
            WhitespaceControl.prototype.MustacheStatement = function (mustache) {
                return mustache.strip;
            };
            WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function (node) {
                var strip = node.strip || {};
                return {
                    inlineStandalone: true,
                    open: strip.open,
                    close: strip.close
                };
            };
            function isPrevWhitespace(body, i, isRoot) {
                if (i === undefined) {
                    i = body.length;
                }
                var prev = body[i - 1], sibling = body[i - 2];
                if (!prev) {
                    return isRoot;
                }
                if (prev.type === 'ContentStatement') {
                    return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
                }
            }
            function isNextWhitespace(body, i, isRoot) {
                if (i === undefined) {
                    i = -1;
                }
                var next = body[i + 1], sibling = body[i + 2];
                if (!next) {
                    return isRoot;
                }
                if (next.type === 'ContentStatement') {
                    return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
                }
            }
            function omitRight(body, i, multiple) {
                var current = body[i == null ? 0 : i + 1];
                if (!current || current.type !== 'ContentStatement' || !multiple && current.rightStripped) {
                    return;
                }
                var original = current.value;
                current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, '');
                current.rightStripped = current.value !== original;
            }
            function omitLeft(body, i, multiple) {
                var current = body[i == null ? body.length - 1 : i - 1];
                if (!current || current.type !== 'ContentStatement' || !multiple && current.leftStripped) {
                    return;
                }
                var original = current.value;
                current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, '');
                current.leftStripped = current.value !== original;
                return current.leftStripped;
            }
            exports['default'] = WhitespaceControl;
            module.exports = exports['default'];
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            var _interopRequireWildcard = __webpack_require__(8)['default'];
            exports.__esModule = true;
            exports.SourceLocation = SourceLocation;
            exports.id = id;
            exports.stripFlags = stripFlags;
            exports.stripComment = stripComment;
            exports.preparePath = preparePath;
            exports.prepareMustache = prepareMustache;
            exports.prepareRawBlock = prepareRawBlock;
            exports.prepareBlock = prepareBlock;
            var _Exception = __webpack_require__(11);
            var _Exception2 = _interopRequireWildcard(_Exception);
            function SourceLocation(source, locInfo) {
                this.source = source;
                this.start = {
                    line: locInfo.first_line,
                    column: locInfo.first_column
                };
                this.end = {
                    line: locInfo.last_line,
                    column: locInfo.last_column
                };
            }
            function id(token) {
                if (/^\[.*\]$/.test(token)) {
                    return token.substr(1, token.length - 2);
                } else {
                    return token;
                }
            }
            function stripFlags(open, close) {
                return {
                    open: open.charAt(2) === '~',
                    close: close.charAt(close.length - 3) === '~'
                };
            }
            function stripComment(comment) {
                return comment.replace(/^\{\{~?\!-?-?/, '').replace(/-?-?~?\}\}$/, '');
            }
            function preparePath(data, parts, locInfo) {
                locInfo = this.locInfo(locInfo);
                var original = data ? '@' : '', dig = [], depth = 0, depthString = '';
                for (var i = 0, l = parts.length; i < l; i++) {
                    var part = parts[i].part, isLiteral = parts[i].original !== part;
                    original += (parts[i].separator || '') + part;
                    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
                        if (dig.length > 0) {
                            throw new _Exception2['default']('Invalid path: ' + original, { loc: locInfo });
                        } else if (part === '..') {
                            depth++;
                            depthString += '../';
                        }
                    } else {
                        dig.push(part);
                    }
                }
                return new this.PathExpression(data, depth, dig, original, locInfo);
            }
            function prepareMustache(path, params, hash, open, strip, locInfo) {
                var escapeFlag = open.charAt(3) || open.charAt(2), escaped = escapeFlag !== '{' && escapeFlag !== '&';
                return new this.MustacheStatement(path, params, hash, escaped, strip, this.locInfo(locInfo));
            }
            function prepareRawBlock(openRawBlock, content, close, locInfo) {
                if (openRawBlock.path.original !== close) {
                    var errorNode = { loc: openRawBlock.path.loc };
                    throw new _Exception2['default'](openRawBlock.path.original + ' doesn\'t match ' + close, errorNode);
                }
                locInfo = this.locInfo(locInfo);
                var program = new this.Program([content], null, {}, locInfo);
                return new this.BlockStatement(openRawBlock.path, openRawBlock.params, openRawBlock.hash, program, undefined, {}, {}, {}, locInfo);
            }
            function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
                if (close && close.path && openBlock.path.original !== close.path.original) {
                    var errorNode = { loc: openBlock.path.loc };
                    throw new _Exception2['default'](openBlock.path.original + ' doesn\'t match ' + close.path.original, errorNode);
                }
                program.blockParams = openBlock.blockParams;
                var inverse = undefined, inverseStrip = undefined;
                if (inverseAndProgram) {
                    if (inverseAndProgram.chain) {
                        inverseAndProgram.program.body[0].closeStrip = close.strip;
                    }
                    inverseStrip = inverseAndProgram.strip;
                    inverse = inverseAndProgram.program;
                }
                if (inverted) {
                    inverted = inverse;
                    inverse = program;
                    program = inverted;
                }
                return new this.BlockStatement(openBlock.path, openBlock.params, openBlock.hash, program, inverse, openBlock.strip, inverseStrip, close && close.strip, this.locInfo(locInfo));
            }
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            exports.__esModule = true;
            var _isArray = __webpack_require__(12);
            var SourceNode = undefined;
            try {
                if (false) {
                    var SourceMap = require('source-map');
                    SourceNode = SourceMap.SourceNode;
                }
            } catch (err) {
            }
            if (!SourceNode) {
                SourceNode = function (line, column, srcFile, chunks) {
                    this.src = '';
                    if (chunks) {
                        this.add(chunks);
                    }
                };
                SourceNode.prototype = {
                    add: function add(chunks) {
                        if (_isArray.isArray(chunks)) {
                            chunks = chunks.join('');
                        }
                        this.src += chunks;
                    },
                    prepend: function prepend(chunks) {
                        if (_isArray.isArray(chunks)) {
                            chunks = chunks.join('');
                        }
                        this.src = chunks + this.src;
                    },
                    toStringWithSourceMap: function toStringWithSourceMap() {
                        return { code: this.toString() };
                    },
                    toString: function toString() {
                        return this.src;
                    }
                };
            }
            function castChunk(chunk, codeGen, loc) {
                if (_isArray.isArray(chunk)) {
                    var ret = [];
                    for (var i = 0, len = chunk.length; i < len; i++) {
                        ret.push(codeGen.wrap(chunk[i], loc));
                    }
                    return ret;
                } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {
                    return chunk + '';
                }
                return chunk;
            }
            function CodeGen(srcFile) {
                this.srcFile = srcFile;
                this.source = [];
            }
            CodeGen.prototype = {
                prepend: function prepend(source, loc) {
                    this.source.unshift(this.wrap(source, loc));
                },
                push: function push(source, loc) {
                    this.source.push(this.wrap(source, loc));
                },
                merge: function merge() {
                    var source = this.empty();
                    this.each(function (line) {
                        source.add([
                            '  ',
                            line,
                            '\n'
                        ]);
                    });
                    return source;
                },
                each: function each(iter) {
                    for (var i = 0, len = this.source.length; i < len; i++) {
                        iter(this.source[i]);
                    }
                },
                empty: function empty() {
                    var loc = arguments[0] === undefined ? this.currentLocation || { start: {} } : arguments[0];
                    return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
                },
                wrap: function wrap(chunk) {
                    var loc = arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];
                    if (chunk instanceof SourceNode) {
                        return chunk;
                    }
                    chunk = castChunk(chunk, this, loc);
                    return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
                },
                functionCall: function functionCall(fn, type, params) {
                    params = this.generateList(params);
                    return this.wrap([
                        fn,
                        type ? '.' + type + '(' : '(',
                        params,
                        ')'
                    ]);
                },
                quotedString: function quotedString(str) {
                    return '"' + (str + '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + '"';
                },
                objectLiteral: function objectLiteral(obj) {
                    var pairs = [];
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            var value = castChunk(obj[key], this);
                            if (value !== 'undefined') {
                                pairs.push([
                                    this.quotedString(key),
                                    ':',
                                    value
                                ]);
                            }
                        }
                    }
                    var ret = this.generateList(pairs);
                    ret.prepend('{');
                    ret.add('}');
                    return ret;
                },
                generateList: function generateList(entries, loc) {
                    var ret = this.empty(loc);
                    for (var i = 0, len = entries.length; i < len; i++) {
                        if (i) {
                            ret.add(',');
                        }
                        ret.add(castChunk(entries[i], this, loc));
                    }
                    return ret;
                },
                generateArray: function generateArray(entries, loc) {
                    var ret = this.generateList(entries, loc);
                    ret.prepend('[');
                    ret.add(']');
                    return ret;
                }
            };
            exports['default'] = CodeGen;
            module.exports = exports['default'];
        }
    ]);
}));
;
define('templates', ['handlebars'], function (Handlebars) {
    this['JST'] = this['JST'] || {};
    this['JST']['class-paper'] = Handlebars.template({
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            return '<div id = \'title\'>\n    <img class = \'text cover\' src = \'images/class_title.png\'>\n</div>\n<div id = "classes">\n    <ul class = "row">\n        <li class = \'item-wrapper col-xs-12\'>\n            <a class = \'class-item\'>\n                <img class = \'bg cover\' src = \'images/class_001.jpg\'>\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/class_001_text.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'item-wrapper col-xs-12\'>\n            <a class = \'class-item\'>\n                <img class = \'bg cover\' src = \'images/class_002.jpg\'>\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/class_002_text.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'item-wrapper col-xs-12\'>\n            <a class = \'class-item\'>\n                <img class = \'bg cover\' src = \'images/class_001.jpg\'>\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/class_003_text.png">\n                </div>\n            </a>\n        </li>\n    </ul>\n</div>\n';
        },
        'useData': true
    });
    this['JST']['class'] = Handlebars.template({
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            return '<div id = "paper">\n    <div id = \'title\'>\n        <img class = \'text cover\' src = \'images/class_title.png\'>\n    </div>\n    <div class = \'wrapper container\'>\n        <div id = "classes">\n            <ul class = "row">\n                <li class = \'item-wrapper col-xs-12\'>\n                    <a class = \'class-item\'>\n                        <img class = \'bg cover\' src = \'images/class_001.jpg\'>\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/class_001_text.png">\n                        </div>\n                    </a>\n                </li>\n                <li class = \'item-wrapper col-xs-12\'>\n                    <a class = \'class-item\'>\n                        <img class = \'bg cover\' src = \'images/class_002.jpg\'>\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/class_002_text.png">\n                        </div>\n                    </a>\n                </li>\n                <li class = \'item-wrapper col-xs-12\'>\n                    <a class = \'class-item\'>\n                        <img class = \'bg cover\' src = \'images/class_001.jpg\'>\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/class_003_text.png">\n                        </div>\n                    </a>\n                </li>\n            </ul>\n        </div>\n    </div>\n</div>\n<div id = "footer-area"></div>';
        },
        'useData': true
    });
    this['JST']['index-banner'] = Handlebars.template({
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            return '<ul class = "swiper-wrapper wrapper">\n    <li class = "swiper-slide banner-item-wrapper">\n        <div class = "banner-item">\n            <a href = \'#\'>\n                <img class = \'bg cover\' src = \'images/banner_01.jpg\'>\n                <img class = \'text cover\' src = \'images/banner_01_txt.png\'>\n            </a>\n        </div>\n    </li>\n    <li class = "swiper-slide banner-item-wrapper">\n        <div class = "banner-item">\n            <a href = \'#\'>\n                <img class = \'bg cover\' src = \'images/banner_01.jpg\'>\n                <img class = \'text cover\' src = \'images/banner_01_txt.png\'>\n            </a>\n        </div>\n    </li>\n    <li class = "swiper-slide banner-item-wrapper">\n        <div class = "banner-item">\n            <a href = \'#\'>\n                <img class = \'bg cover\' src = \'images/banner_01.jpg\'>\n                <img class = \'text cover\' src = \'images/banner_01_txt.png\'>\n            </a>\n        </div>\n    </li>\n</ul>';
        },
        'useData': true
    });
    this['JST']['index-paper'] = Handlebars.template({
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            return '<div id = "news">\n    <ul class = "row">\n        <li class = \'item-wrapper col-xs-12 col-sm-4\'>\n            <a class = \'news-item\'>\n                <img class = \'bg cover\' src = \'images/news_01.jpg\'>\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/news_01_txt.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'item-wrapper col-xs-12 col-sm-4\'>\n            <a class = \'news-item\'>\n                <img class = \'bg cover\' src = \'images/news_02.jpg\'>\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/news_02_txt.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'item-wrapper col-xs-12 col-sm-4\'>\n            <a class = \'news-item\'>\n                <img class = \'bg cover\' src = \'images/news_03.jpg\'>\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/news_03_txt.png">\n                </div>\n            </a>\n        </li>\n    </ul>\n</div>\n<div id = "hole">\n    <div class = \'hole-bg\'>\n        <img src = \'images/hole-bg.jpg\'>\n    </div>\n    <img class = \'hole-text\' src = "images/hole.png">\n</div>\n<div id = "bulletin">\n    <ul class = "row">\n        <li class = \'col-md-9 col-sm-9 col-xs-12\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_001.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/001_small.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'col-md-3 col-sm-3 col-xs-6\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_002.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/002_small.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'col-md-4 col-sm-4 col-xs-6\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_003.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/003_small.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'col-md-4 col-sm-4 col-xs-6\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_004.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/004_small.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'col-md-4 col-sm-4 col-xs-6\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_005.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/005_small.png">\n                </div>\n            </a>\n        </li>\n    </ul>\n</div>\n<div id = "insta">\n    <header class = \'insta-header\'>\n        <h2>#BEAN_BROTHERS</h2>\n    </header>\n    <!--<img class = \'loading\' src = \'images/loading.gif\'>-->\n</div>';
        },
        'useData': true
    });
    this['JST']['index'] = Handlebars.template({
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            return '<div id = "banner" class = "swiper-container">\n    <ul class = "swiper-wrapper wrapper">\n        <li class = "swiper-slide banner-item-wrapper">\n            <div class = "banner-item">\n                <a href = \'#\'>\n                    <img class = \'bg cover\' src = \'images/banner_01.jpg\'>\n                    <img class = \'text cover\' src = \'images/banner_01_txt.png\'>\n                </a>\n            </div>\n        </li>\n        <li class = "swiper-slide banner-item-wrapper">\n            <div class = "banner-item">\n                <a href = \'#\'>\n                    <img class = \'bg cover\' src = \'images/banner_01.jpg\'>\n                    <img class = \'text cover\' src = \'images/banner_01_txt.png\'>\n                </a>\n            </div>\n        </li>\n        <li class = "swiper-slide banner-item-wrapper">\n            <div class = "banner-item">\n                <a href = \'#\'>\n                    <img class = \'bg cover\' src = \'images/banner_01.jpg\'>\n                    <img class = \'text cover\' src = \'images/banner_01_txt.png\'>\n                </a>\n            </div>\n        </li>\n    </ul>\n</div>\n<div id = "banner-area"></div>\n<div id = "paper">\n    <div class = \'wrapper container\'>\n        <div id = "news">\n            <ul class = "row">\n                <li class = \'item-wrapper col-xs-12 col-sm-4\'>\n                    <a class = \'news-item\'>\n                        <img class = \'bg cover\' src = \'images/news_01.jpg\'>\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/news_01_txt.png">\n                        </div>\n                    </a>\n                </li>\n                <li class = \'item-wrapper col-xs-12 col-sm-4\'>\n                    <a class = \'news-item\'>\n                        <img class = \'bg cover\' src = \'images/news_02.jpg\'>\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/news_02_txt.png">\n                        </div>\n                    </a>\n                </li>\n                <li class = \'item-wrapper col-xs-12 col-sm-4\'>\n                    <a class = \'news-item\'>\n                        <img class = \'bg cover\' src = \'images/news_03.jpg\'>\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/news_03_txt.png">\n                        </div>\n                    </a>\n                </li>\n            </ul>\n        </div>\n        <div id = "hole">\n            <div class = \'hole-bg\'>\n                <img src = \'images/hole-bg.jpg\'>\n            </div>\n            <img class = \'hole-text\' src = "images/hole.png">\n        </div>\n        <div id = "bulletin">\n            <ul class = "row">\n                <li class = \'col-md-9 col-sm-9 col-xs-12\'>\n                    <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_001.jpg);">\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/001_small.png">\n                        </div>\n                    </a>\n                </li>\n                <li class = \'col-md-3 col-sm-3 col-xs-6\'>\n                    <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_002.jpg);">\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/002_small.png">\n                        </div>\n                    </a>\n                </li>\n                <li class = \'col-md-4 col-sm-4 col-xs-6\'>\n                    <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_003.jpg);">\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/003_small.png">\n                        </div>\n                    </a>\n                </li>\n                <li class = \'col-md-4 col-sm-4 col-xs-6\'>\n                    <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_004.jpg);">\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/004_small.png">\n                        </div>\n                    </a>\n                </li>\n                <li class = \'col-md-4 col-sm-4 col-xs-6\'>\n                    <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_005.jpg);">\n                        <div class = \'text-wrapper\'>\n                            <img class = \'text cover\' src = "images/005_small.png">\n                        </div>\n                    </a>\n                </li>\n            </ul>\n        </div>\n        <div id = "insta">\n            <header class = \'insta-header\'>\n                <h2>#BEAN_BROTHERS</h2>\n            </header>\n            <!--<img class = \'loading\' src = \'images/loading.gif\'>-->\n        </div>\n    </div>\n</div>\n<div id = "footer-area"></div>';
        },
        'useData': true
    });
    this['JST']['instaItem'] = Handlebars.template({
        '1': function (depth0, helpers, partials, data) {
            return '<li class = "insta-item\n    col-xs-8 col-sm-4 col-md-2 item-big">\n    <img src = " ">\n\n    col-xs-4 col-sm-2 col-md-1 item-small">\n    <img src = " " >\n</li>\n';
        },
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            var stack1;
            return (stack1 = helpers.each.call(depth0, depth0 != null ? depth0.instaData : depth0, {
                'name': 'each',
                'hash': {},
                'fn': this.program(1, data, 0),
                'inverse': this.noop,
                'data': data
            })) != null ? stack1 : '';
        },
        'useData': true
    });
    this['JST']['layout'] = Handlebars.template({
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            var stack1, helper;
            return '<!doctype html>\n<html class="no-js" lang="">\n<head>\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\n    <title></title>\n    <meta name="description" content="">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <link rel="apple-touch-icon" href="apple-touch-icon.png">\n\n    <!--<link rel="stylesheet" href="styles/normalize.min.css">-->\n    <link rel="stylesheet" href="styles/style.css">\n\n    <script src="scripts/vendor/modernizr.js"></script>\n\n    <!--<script src="scripts/vendor/modernizr-2.8.3.min.js"></script>-->\n</head>\n<body>\n<!--[if lt IE 10]>\n<p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>\n<![endif]-->\n\n<!-- #shell start -->\n<div id = \'shell\'>\n    <header id = \'header\' class = \'header navbar navbar-default navbar-fixed-top\'>\n        <div class = \'container\'>\n            <div class = \'navbar-header\'>\n                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#mobile-nav">\n                    <span class="icon-bar"></span>\n                    <span class="icon-bar"></span>\n                    <span class="icon-bar"></span>\n                </button>\n                <a href = "/" class = \'logo navbar-brand\'>\n                    <img class = \'white\' src = "images/BEANBROTHERS_white.png">\n                    <img class = \'black\' src = "images/BEANBROTHERS.png">\n                </a>\n                <!--\n                                        <button>\n                                            <a class = \'cart collapsed hidden-sm hidden-md hidden-lg \' href = "/#" data-toggle="collapse" data-target=".cart-collapse">\uC7A5\uBC14\uAD6C\uB2C8</a>\n                                        </button>\n                -->\n            </div>\n            <ul id = \'right-nav\' class = "nav navbar-nav navbar-right collapse navbar-collapse">\n                <li><a class = \'hire inverse-hide\' href = "/recruit">\uCC44\uC6A9</a></li>\n                <li><a class = \'business inverse-hide\' href = "http://b.beanbrothers.co.kr/">\uBE44\uC988\uB2C8\uC2A4</a></li>\n                <li><a class = \'event inverse-hide\' href = "/events">\uC774\uBCA4\uD2B8</a></li>\n                <li>\n                    <a class = \'login\' href = "/login" data-hover=\'dropdown\'>\uB85C\uADF8\uC778</a>\n                    <ul class = \'dropdown-menu\'>\n                        <li><a href="#">My Account</a></li>\n                    </ul>\n                </li>\n                <li>\n                    <a class = \'cart inverse-hide\' href = "/cart" data-hover="dropdown">\uC7A5\uBC14\uAD6C\uB2C8</a>\n                    <ul class = \'dropdown-menu\'>\n                        <li><a href="#">\uC7A5\uBC14\uAD6C\uB2C8</a></li>\n                    </ul>\n                </li>\n            </ul>\n            <ul id = \'left-nav\' class = "nav navbar-nav navbar-left collapse navbar-collapse">\n                <li><a class = \'cafe\' href = "/cafe">\uCE74\uD398</a></li>\n                <li><a class = \'goods\' href = "/product">\uC0C1\uD488</a></li>\n                <li><a class = \'subscribe inverse-hide\' href = "/subscription">\uCEE4\uD53C\uAD6C\uB3C5</a></li>\n                <li><a class = \'guide inverse-hide\' href = "/blog">\uAC00\uC774\uB4DC</a></li>\n                <li><a class = \'class inverse-hide\' href = "class">\uD074\uB798\uC2A4</a></li>\n            </ul>\n\n        </div>\n\n        <div id = \'mobile-nav\' class = "nav navbar-nav collapse container-fluid hidden-md hidden-lg">\n            <div class = \'container\'>\n                <ul class = \'row nav navbar-nav\'>\n                    <li><a class = \'login col-xs-12 col-sm-6\' href = "/#" data-toggle="collapse" data-target=".login-collapse">\uB85C\uADF8\uC778</a>\n\n                    </li>\n                    <li><a class = \'cart col-xs-12 col-sm-6 collapsed hidden-xs\' href = "/#" data-toggle="collapse" data-target=".cart-collapse">\uC7A5\uBC14\uAD6C\uB2C8</a></li>\n                </ul>\n                <ul class = \'login-collapse collapse\'>\n                    <li> \uBAA8\uBC14\uC77C \uB85C\uADF8\uC778</li>\n                </ul>\n                <!--\n                                        <ul class = \'cart-collapse collapse\'>\n                                            <li> \uBAA8\uBC14\uC77C \uC7A5\uBC14\uAD6C\uB2C8</li>\n                                        </ul>\n                -->\n                <hr>\n                <ul class = \'row nav navbar-nav \'>\n                    <li><a class = \'cafe col-xs-12 col-sm-6\' href = "/cafe">\uCE74\uD398</a></li>\n                    <li><a class = \'goods col-xs-12 col-sm-6\'href = "/product">\uC0C1\uD488</a></li>\n                    <li><a class = \'subscribe col-xs-12 col-sm-6\' href = "/subscription">\uCEE4\uD53C\uAD6C\uB3C5</a></li>\n                    <li><a class = \'guide col-xs-12 col-sm-6\' href = "/blog">\uAC00\uC774\uB4DC</a></li>\n                    <li><a class = \'class col-xs-12 col-sm-6\' href = "#">\uD074\uB798\uC2A4</a></li>\n                    <li><a class = \'hire col-xs-12 col-sm-6\' href = "/recruit">\uCC44\uC6A9</a></li>\n                    <li><a class = \'business col-xs-12 col-sm-6\' href = "http://b.beanbrothers.co.kr/">\uBE44\uC988\uB2C8\uC2A4</a></li>\n                    <li><a class = \'event col-xs-12 col-sm-6\' href = "/events">\uC774\uBCA4\uD2B8</a></li>\n                </ul>\n                <hr>\n            </div>\n\n        </div>\n    </header>\n    <div id = \'main\'>\n        ' + ((stack1 = (helper = (helper = helpers.body || (depth0 != null ? depth0.body : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
                'name': 'body',
                'hash': {},
                'data': data
            }) : helper)) != null ? stack1 : '') + '\n    </div><!-- #main -->\n    <footer id = \'footer\' class = "navbar navbar-fixed-bottom">\n        <div class = \'container\'>\n            <div class = \'footer-info row\'>\n                <div class = \'col-xs-4 col-sm-4 col-md-2\'>\n                    <img class = \'logo\'src = \'images/TEST_01_ACG.png\'>\n                </div>\n                <div class = \'name col-xs-8 col-sm-8 col-md-10\'>\n                    <h1>(\uC8FC)\uC5D0\uC774\uBE14\uCEE4\uD53C\uADF8\uB8F9</h1>\n                </div>\n                <div class = \'detail col-xs-12 col-sm-8 col-md-10\'>\n                    <p>\uB300\uD45C: \uBC15\uC131\uD638 | \uC8FC\uC18C: \uC11C\uC6B8\uC2DC \uB9C8\uD3EC\uAD6C \uD1A0\uC815\uB85C 12, 3\uCE35 | \uC804\uD654\uBC88\uD638: 02-6204-7888 | \uC774\uBA54\uC77C: info@beanbrothers.co.kr </p>\n                    <p>\n                        \uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638: 220-87-84283  |  \uD1B5\uC2E0\uD310\uB9E4\uC5C5\uC2E0\uACE0\uBC88\uD638: \uC81C 2013 \uC11C\uC6B8\uAC15\uB0A8 00744\uD638 | \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uCC45\uC784\uC790: \uC11C\uC194 privacy@beanbrothers.co.kr </p>\n                    <h2>\n                        \u24D2 2014 BEAN BROTHERS. All rights reserved.\n                    </h2>\n                </div>\n            </div>\n            <div class = \'line\'></div>\n            <div class = \'footer-link\'>\n                <nav class = \'link\'>\n                    <ul>\n                        <li><a href = \'/about\'>\uBE48\uBE0C\uB77C\uB354\uC2A4\uB294?</a></li>\n                        <li><a href = \'/privacy\'>\uC774\uC6A9\uC57D\uAD00 \uBC0F \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638</a></li>\n                        <li><a href = \'/help/qna\'>\uBB38\uC758\uD558\uAE30</a></li>\n                    </ul>\n                </nav>\n                <nav class = \'sns\'>\n                    <a class = \'blog icon\' href = \'#\'>\n                        <img src = \'images/blog.png\'>\n                    </a>\n                    <a class = \'facebook icon\' href = \'#\'>\n                        <img src = \'images/facebook.png\'>\n                    </a>\n                    <a class = \'instagram icon\' href = \'#\'>\n                        <img src = \'images/insta.png\'>\n                    </a>\n                </nav>\n            </div>\n        </div>\n    </footer>\n</div>\n\n<script src="scripts/vendor/require.js" data-main="scripts/main"></script>\n\n<!-- Google Analytics: change UA-XXXXX-X to be your site\'s ID. -->\n<script>\n    (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=\n            function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;\n        e=o.createElement(i);r=o.getElementsByTagName(i)[0];\n        e.src=\'//www.google-analytics.com/analytics.js\';\n        r.parentNode.insertBefore(e,r)}(window,document,\'script\',\'ga\'));\n    ga(\'create\',\'UA-XXXXX-X\',\'auto\');ga(\'send\',\'pageview\');\n</script>\n</body>\n</html>\n';
        },
        'useData': true
    });
    this['JST']['paper'] = this['JST']['paper'] || {};
    this['JST']['paper']['class'] = Handlebars.template({
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            return '<div class = \'wrapper container\'>\n    <div id = \'title\'>\n        <img class = \'text cover\' src = \'images/class_title.png\'>\n    </div>\n    <div id = "classes">\n        <ul class = "row">\n            <li class = \'item-wrapper col-xs-12\'>\n                <a class = \'class-item\'>\n                    <img class = \'bg cover\' src = \'images/class_001.jpg\'>\n                    <div class = \'text-wrapper\'>\n                        <img class = \'text cover\' src = "images/class_001_text.png">\n                    </div>\n                </a>\n            </li>\n            <li class = \'item-wrapper col-xs-12\'>\n                <a class = \'class-item\'>\n                    <img class = \'bg cover\' src = \'images/class_002.jpg\'>\n                    <div class = \'text-wrapper\'>\n                        <img class = \'text cover\' src = "images/class_002_text.png">\n                    </div>\n                </a>\n            </li>\n            <li class = \'item-wrapper col-xs-12\'>\n                <a class = \'class-item\'>\n                    <img class = \'bg cover\' src = \'images/class_001.jpg\'>\n                    <div class = \'text-wrapper\'>\n                        <img class = \'text cover\' src = "images/class_003_text.png">\n                    </div>\n                </a>\n            </li>\n        </ul>\n    </div>\n</div>';
        },
        'useData': true
    });
    this['JST']['paper']['index'] = Handlebars.template({
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            return '<div id = "news">\n    <ul class = "row">\n        <li class = \'item-wrapper col-xs-12 col-sm-4\'>\n            <a class = \'news-item\'>\n                <img class = \'bg cover\' src = \'images/news_01.jpg\'>\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/news_01_txt.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'item-wrapper col-xs-12 col-sm-4\'>\n            <a class = \'news-item\'>\n                <img class = \'bg cover\' src = \'images/news_02.jpg\'>\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/news_02_txt.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'item-wrapper col-xs-12 col-sm-4\'>\n            <a class = \'news-item\'>\n                <img class = \'bg cover\' src = \'images/news_03.jpg\'>\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/news_03_txt.png">\n                </div>\n            </a>\n        </li>\n    </ul>\n</div>\n<div id = "hole">\n    <div class = \'hole-bg\'>\n        <img src = \'images/hole-bg.jpg\'>\n    </div>\n    <img class = \'hole-text\' src = "images/hole.png">\n</div>\n<div id = "bulletin">\n    <ul class = "row">\n        <li class = \'col-md-9 col-sm-9 col-xs-12\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_001.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/001_small.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'col-md-3 col-sm-3 col-xs-6\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_002.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/002_small.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'col-md-4 col-sm-4 col-xs-6\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_003.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/003_small.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'col-md-4 col-sm-4 col-xs-6\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_004.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/004_small.png">\n                </div>\n            </a>\n        </li>\n        <li class = \'col-md-4 col-sm-4 col-xs-6\'>\n            <a class = \'bulletin-item\' style = "background-image:url(images/bulletin_005.jpg);">\n                <div class = \'text-wrapper\'>\n                    <img class = \'text cover\' src = "images/005_small.png">\n                </div>\n            </a>\n        </li>\n    </ul>\n</div>\n<div id = "insta">\n    <header class = \'insta-header\'>\n        <h2>#BEAN_BROTHERS</h2>\n    </header>\n    <!--<img class = \'loading\' src = \'images/loading.gif\'>-->\n</div>';
        },
        'useData': true
    });
    this['JST']['banner'] = this['JST']['banner'] || {};
    this['JST']['banner']['index'] = Handlebars.template({
        'compiler': [
            6,
            '>= 2.0.0-beta.1'
        ],
        'main': function (depth0, helpers, partials, data) {
            return '<ul class = "swiper-wrapper wrapper">\n    <li class = "swiper-slide banner-item-wrapper">\n        <div class = "banner-item">\n            <a href = \'#\'>\n                <img class = \'bg cover\' src = \'images/banner_01.jpg\'>\n                <img class = \'text cover\' src = \'images/banner_01_txt.png\'>\n            </a>\n        </div>\n    </li>\n    <li class = "swiper-slide banner-item-wrapper">\n        <div class = "banner-item">\n            <a href = \'#\'>\n                <img class = \'bg cover\' src = \'images/banner_01.jpg\'>\n                <img class = \'text cover\' src = \'images/banner_01_txt.png\'>\n            </a>\n        </div>\n    </li>\n    <li class = "swiper-slide banner-item-wrapper">\n        <div class = "banner-item">\n            <a href = \'#\'>\n                <img class = \'bg cover\' src = \'images/banner_01.jpg\'>\n                <img class = \'text cover\' src = \'images/banner_01_txt.png\'>\n            </a>\n        </div>\n    </li>\n</ul>';
        },
        'useData': true
    });
    return this['JST'];
});
(function () {
    'use strict';
    var Swiper = function (container, params) {
        if (!(this instanceof Swiper))
            return new Swiper(container, params);
        var defaults = {
            direction: 'horizontal',
            touchEventsTarget: 'container',
            initialSlide: 0,
            speed: 300,
            autoplay: false,
            autoplayDisableOnInteraction: true,
            freeMode: false,
            freeModeMomentum: true,
            freeModeMomentumRatio: 1,
            freeModeMomentumBounce: true,
            freeModeMomentumBounceRatio: 1,
            freeModeSticky: false,
            setWrapperSize: false,
            virtualTranslate: false,
            effect: 'slide',
            coverflow: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true
            },
            cube: {
                slideShadows: true,
                shadow: true,
                shadowOffset: 20,
                shadowScale: 0.94
            },
            fade: { crossFade: false },
            parallax: false,
            scrollbar: null,
            scrollbarHide: true,
            keyboardControl: false,
            mousewheelControl: false,
            mousewheelReleaseOnEdges: false,
            mousewheelInvert: false,
            mousewheelForceToAxis: false,
            hashnav: false,
            spaceBetween: 0,
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerColumnFill: 'column',
            slidesPerGroup: 1,
            centeredSlides: false,
            touchRatio: 1,
            touchAngle: 45,
            simulateTouch: true,
            shortSwipes: true,
            longSwipes: true,
            longSwipesRatio: 0.5,
            longSwipesMs: 300,
            followFinger: true,
            onlyExternal: false,
            threshold: 0,
            touchMoveStopPropagation: true,
            pagination: null,
            paginationClickable: false,
            paginationHide: false,
            paginationBulletRender: null,
            resistance: true,
            resistanceRatio: 0.85,
            nextButton: null,
            prevButton: null,
            watchSlidesProgress: false,
            watchSlidesVisibility: false,
            grabCursor: false,
            preventClicks: true,
            preventClicksPropagation: true,
            slideToClickedSlide: false,
            lazyLoading: false,
            lazyLoadingInPrevNext: false,
            lazyLoadingOnTransitionStart: false,
            preloadImages: true,
            updateOnImagesReady: true,
            loop: false,
            loopAdditionalSlides: 0,
            loopedSlides: null,
            control: undefined,
            controlInverse: false,
            allowSwipeToPrev: true,
            allowSwipeToNext: true,
            swipeHandler: null,
            noSwiping: true,
            noSwipingClass: 'swiper-no-swiping',
            slideClass: 'swiper-slide',
            slideActiveClass: 'swiper-slide-active',
            slideVisibleClass: 'swiper-slide-visible',
            slideDuplicateClass: 'swiper-slide-duplicate',
            slideNextClass: 'swiper-slide-next',
            slidePrevClass: 'swiper-slide-prev',
            wrapperClass: 'swiper-wrapper',
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
            buttonDisabledClass: 'swiper-button-disabled',
            paginationHiddenClass: 'swiper-pagination-hidden',
            observer: false,
            observeParents: false,
            a11y: false,
            prevSlideMessage: 'Previous slide',
            nextSlideMessage: 'Next slide',
            firstSlideMessage: 'This is the first slide',
            lastSlideMessage: 'This is the last slide',
            runCallbacksOnInit: true
        };
        var initialVirtualTranslate = params && params.virtualTranslate;
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            } else if (typeof params[def] === 'object') {
                for (var deepDef in defaults[def]) {
                    if (typeof params[def][deepDef] === 'undefined') {
                        params[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }
        var s = this;
        s.version = '3.0.8';
        s.params = params;
        s.classNames = [];
        var $;
        if (typeof Dom7 === 'undefined') {
            $ = window.Dom7 || window.Zepto || window.jQuery;
        } else {
            $ = Dom7;
        }
        if (!$)
            return;
        s.$ = $;
        s.container = $(container);
        if (s.container.length === 0)
            return;
        if (s.container.length > 1) {
            s.container.each(function () {
                new Swiper(this, params);
            });
            return;
        }
        s.container[0].swiper = s;
        s.container.data('swiper', s);
        s.classNames.push('swiper-container-' + s.params.direction);
        if (s.params.freeMode) {
            s.classNames.push('swiper-container-free-mode');
        }
        if (!s.support.flexbox) {
            s.classNames.push('swiper-container-no-flexbox');
            s.params.slidesPerColumn = 1;
        }
        if (s.params.parallax || s.params.watchSlidesVisibility) {
            s.params.watchSlidesProgress = true;
        }
        if ([
                'cube',
                'coverflow'
            ].indexOf(s.params.effect) >= 0) {
            if (s.support.transforms3d) {
                s.params.watchSlidesProgress = true;
                s.classNames.push('swiper-container-3d');
            } else {
                s.params.effect = 'slide';
            }
        }
        if (s.params.effect !== 'slide') {
            s.classNames.push('swiper-container-' + s.params.effect);
        }
        if (s.params.effect === 'cube') {
            s.params.resistanceRatio = 0;
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.centeredSlides = false;
            s.params.spaceBetween = 0;
            s.params.virtualTranslate = true;
            s.params.setWrapperSize = false;
        }
        if (s.params.effect === 'fade') {
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.watchSlidesProgress = true;
            s.params.spaceBetween = 0;
            if (typeof initialVirtualTranslate === 'undefined') {
                s.params.virtualTranslate = true;
            }
        }
        if (s.params.grabCursor && s.support.touch) {
            s.params.grabCursor = false;
        }
        s.wrapper = s.container.children('.' + s.params.wrapperClass);
        if (s.params.pagination) {
            s.paginationContainer = $(s.params.pagination);
            if (s.params.paginationClickable) {
                s.paginationContainer.addClass('swiper-pagination-clickable');
            }
        }
        function isH() {
            return s.params.direction === 'horizontal';
        }
        s.rtl = isH() && (s.container[0].dir.toLowerCase() === 'rtl' || s.container.css('direction') === 'rtl');
        if (s.rtl) {
            s.classNames.push('swiper-container-rtl');
        }
        if (s.rtl) {
            s.wrongRTL = s.wrapper.css('display') === '-webkit-box';
        }
        if (s.params.slidesPerColumn > 1) {
            s.classNames.push('swiper-container-multirow');
        }
        if (s.device.android) {
            s.classNames.push('swiper-container-android');
        }
        s.container.addClass(s.classNames.join(' '));
        s.translate = 0;
        s.progress = 0;
        s.velocity = 0;
        s.lockSwipeToNext = function () {
            s.params.allowSwipeToNext = false;
        };
        s.lockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = false;
        };
        s.lockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = false;
        };
        s.unlockSwipeToNext = function () {
            s.params.allowSwipeToNext = true;
        };
        s.unlockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = true;
        };
        s.unlockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = true;
        };
        if (s.params.grabCursor) {
            s.container[0].style.cursor = 'move';
            s.container[0].style.cursor = '-webkit-grab';
            s.container[0].style.cursor = '-moz-grab';
            s.container[0].style.cursor = 'grab';
        }
        s.imagesToLoad = [];
        s.imagesLoaded = 0;
        s.loadImage = function (imgElement, src, checkForComplete, callback) {
            var image;
            function onReady() {
                if (callback)
                    callback();
            }
            if (!imgElement.complete || !checkForComplete) {
                if (src) {
                    image = new window.Image();
                    image.onload = onReady;
                    image.onerror = onReady;
                    image.src = src;
                } else {
                    onReady();
                }
            } else {
                onReady();
            }
        };
        s.preloadImages = function () {
            s.imagesToLoad = s.container.find('img');
            function _onReady() {
                if (typeof s === 'undefined' || s === null)
                    return;
                if (s.imagesLoaded !== undefined)
                    s.imagesLoaded++;
                if (s.imagesLoaded === s.imagesToLoad.length) {
                    if (s.params.updateOnImagesReady)
                        s.update();
                    s.emit('onImagesReady', s);
                }
            }
            for (var i = 0; i < s.imagesToLoad.length; i++) {
                s.loadImage(s.imagesToLoad[i], s.imagesToLoad[i].currentSrc || s.imagesToLoad[i].getAttribute('src'), true, _onReady);
            }
        };
        s.autoplayTimeoutId = undefined;
        s.autoplaying = false;
        s.autoplayPaused = false;
        function autoplay() {
            s.autoplayTimeoutId = setTimeout(function () {
                if (s.params.loop) {
                    s.fixLoop();
                    s._slideNext();
                } else {
                    if (!s.isEnd) {
                        s._slideNext();
                    } else {
                        if (!params.autoplayStopOnLast) {
                            s._slideTo(0);
                        } else {
                            s.stopAutoplay();
                        }
                    }
                }
            }, s.params.autoplay);
        }
        s.startAutoplay = function () {
            if (typeof s.autoplayTimeoutId !== 'undefined')
                return false;
            if (!s.params.autoplay)
                return false;
            if (s.autoplaying)
                return false;
            s.autoplaying = true;
            s.emit('onAutoplayStart', s);
            autoplay();
        };
        s.stopAutoplay = function (internal) {
            if (!s.autoplayTimeoutId)
                return;
            if (s.autoplayTimeoutId)
                clearTimeout(s.autoplayTimeoutId);
            s.autoplaying = false;
            s.autoplayTimeoutId = undefined;
            s.emit('onAutoplayStop', s);
        };
        s.pauseAutoplay = function (speed) {
            if (s.autoplayPaused)
                return;
            if (s.autoplayTimeoutId)
                clearTimeout(s.autoplayTimeoutId);
            s.autoplayPaused = true;
            if (speed === 0) {
                s.autoplayPaused = false;
                autoplay();
            } else {
                s.wrapper.transitionEnd(function () {
                    if (!s)
                        return;
                    s.autoplayPaused = false;
                    if (!s.autoplaying) {
                        s.stopAutoplay();
                    } else {
                        autoplay();
                    }
                });
            }
        };
        s.minTranslate = function () {
            return -s.snapGrid[0];
        };
        s.maxTranslate = function () {
            return -s.snapGrid[s.snapGrid.length - 1];
        };
        s.updateContainerSize = function () {
            var width, height;
            if (typeof s.params.width !== 'undefined') {
                width = s.params.width;
            } else {
                width = s.container[0].clientWidth;
            }
            if (typeof s.params.height !== 'undefined') {
                height = s.params.height;
            } else {
                height = s.container[0].clientHeight;
            }
            if (width === 0 && isH() || height === 0 && !isH()) {
                return;
            }
            s.width = width;
            s.height = height;
            s.size = isH() ? s.width : s.height;
        };
        s.updateSlidesSize = function () {
            s.slides = s.wrapper.children('.' + s.params.slideClass);
            s.snapGrid = [];
            s.slidesGrid = [];
            s.slidesSizesGrid = [];
            var spaceBetween = s.params.spaceBetween, slidePosition = 0, i, prevSlideSize = 0, index = 0;
            if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
                spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * s.size;
            }
            s.virtualSize = -spaceBetween;
            if (s.rtl)
                s.slides.css({
                    marginLeft: '',
                    marginTop: ''
                });
            else
                s.slides.css({
                    marginRight: '',
                    marginBottom: ''
                });
            var slidesNumberEvenToRows;
            if (s.params.slidesPerColumn > 1) {
                if (Math.floor(s.slides.length / s.params.slidesPerColumn) === s.slides.length / s.params.slidesPerColumn) {
                    slidesNumberEvenToRows = s.slides.length;
                } else {
                    slidesNumberEvenToRows = Math.ceil(s.slides.length / s.params.slidesPerColumn) * s.params.slidesPerColumn;
                }
            }
            var slideSize;
            var slidesPerColumn = s.params.slidesPerColumn;
            var slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
            var numFullColumns = slidesPerRow - (s.params.slidesPerColumn * slidesPerRow - s.slides.length);
            for (i = 0; i < s.slides.length; i++) {
                slideSize = 0;
                var slide = s.slides.eq(i);
                if (s.params.slidesPerColumn > 1) {
                    var newSlideOrderIndex;
                    var column, row;
                    if (s.params.slidesPerColumnFill === 'column') {
                        column = Math.floor(i / slidesPerColumn);
                        row = i - column * slidesPerColumn;
                        if (column > numFullColumns || column === numFullColumns && row === slidesPerColumn - 1) {
                            if (++row >= slidesPerColumn) {
                                row = 0;
                                column++;
                            }
                        }
                        newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
                        slide.css({
                            '-webkit-box-ordinal-group': newSlideOrderIndex,
                            '-moz-box-ordinal-group': newSlideOrderIndex,
                            '-ms-flex-order': newSlideOrderIndex,
                            '-webkit-order': newSlideOrderIndex,
                            'order': newSlideOrderIndex
                        });
                    } else {
                        row = Math.floor(i / slidesPerRow);
                        column = i - row * slidesPerRow;
                    }
                    slide.css({ 'margin-top': row !== 0 && s.params.spaceBetween && s.params.spaceBetween + 'px' }).attr('data-swiper-column', column).attr('data-swiper-row', row);
                }
                if (slide.css('display') === 'none')
                    continue;
                if (s.params.slidesPerView === 'auto') {
                    slideSize = isH() ? slide.outerWidth(true) : slide.outerHeight(true);
                } else {
                    slideSize = (s.size - (s.params.slidesPerView - 1) * spaceBetween) / s.params.slidesPerView;
                    if (isH()) {
                        s.slides[i].style.width = slideSize + 'px';
                    } else {
                        s.slides[i].style.height = slideSize + 'px';
                    }
                }
                s.slides[i].swiperSlideSize = slideSize;
                s.slidesSizesGrid.push(slideSize);
                if (s.params.centeredSlides) {
                    slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                    if (i === 0)
                        slidePosition = slidePosition - s.size / 2 - spaceBetween;
                    if (Math.abs(slidePosition) < 1 / 1000)
                        slidePosition = 0;
                    if (index % s.params.slidesPerGroup === 0)
                        s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                } else {
                    if (index % s.params.slidesPerGroup === 0)
                        s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                    slidePosition = slidePosition + slideSize + spaceBetween;
                }
                s.virtualSize += slideSize + spaceBetween;
                prevSlideSize = slideSize;
                index++;
            }
            s.virtualSize = Math.max(s.virtualSize, s.size);
            var newSlidesGrid;
            if (s.rtl && s.wrongRTL && (s.params.effect === 'slide' || s.params.effect === 'coverflow')) {
                s.wrapper.css({ width: s.virtualSize + s.params.spaceBetween + 'px' });
            }
            if (!s.support.flexbox || s.params.setWrapperSize) {
                if (isH())
                    s.wrapper.css({ width: s.virtualSize + s.params.spaceBetween + 'px' });
                else
                    s.wrapper.css({ height: s.virtualSize + s.params.spaceBetween + 'px' });
            }
            if (s.params.slidesPerColumn > 1) {
                s.virtualSize = (slideSize + s.params.spaceBetween) * slidesNumberEvenToRows;
                s.virtualSize = Math.ceil(s.virtualSize / s.params.slidesPerColumn) - s.params.spaceBetween;
                s.wrapper.css({ width: s.virtualSize + s.params.spaceBetween + 'px' });
                if (s.params.centeredSlides) {
                    newSlidesGrid = [];
                    for (i = 0; i < s.snapGrid.length; i++) {
                        if (s.snapGrid[i] < s.virtualSize + s.snapGrid[0])
                            newSlidesGrid.push(s.snapGrid[i]);
                    }
                    s.snapGrid = newSlidesGrid;
                }
            }
            if (!s.params.centeredSlides) {
                newSlidesGrid = [];
                for (i = 0; i < s.snapGrid.length; i++) {
                    if (s.snapGrid[i] <= s.virtualSize - s.size) {
                        newSlidesGrid.push(s.snapGrid[i]);
                    }
                }
                s.snapGrid = newSlidesGrid;
                if (Math.floor(s.virtualSize - s.size) > Math.floor(s.snapGrid[s.snapGrid.length - 1])) {
                    s.snapGrid.push(s.virtualSize - s.size);
                }
            }
            if (s.snapGrid.length === 0)
                s.snapGrid = [0];
            if (s.params.spaceBetween !== 0) {
                if (isH()) {
                    if (s.rtl)
                        s.slides.css({ marginLeft: spaceBetween + 'px' });
                    else
                        s.slides.css({ marginRight: spaceBetween + 'px' });
                } else
                    s.slides.css({ marginBottom: spaceBetween + 'px' });
            }
            if (s.params.watchSlidesProgress) {
                s.updateSlidesOffset();
            }
        };
        s.updateSlidesOffset = function () {
            for (var i = 0; i < s.slides.length; i++) {
                s.slides[i].swiperSlideOffset = isH() ? s.slides[i].offsetLeft : s.slides[i].offsetTop;
            }
        };
        s.updateSlidesProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            if (s.slides.length === 0)
                return;
            if (typeof s.slides[0].swiperSlideOffset === 'undefined')
                s.updateSlidesOffset();
            var offsetCenter = s.params.centeredSlides ? -translate + s.size / 2 : -translate;
            if (s.rtl)
                offsetCenter = s.params.centeredSlides ? translate - s.size / 2 : translate;
            var containerBox = s.container[0].getBoundingClientRect();
            var sideBefore = isH() ? 'left' : 'top';
            var sideAfter = isH() ? 'right' : 'bottom';
            s.slides.removeClass(s.params.slideVisibleClass);
            for (var i = 0; i < s.slides.length; i++) {
                var slide = s.slides[i];
                var slideCenterOffset = s.params.centeredSlides === true ? slide.swiperSlideSize / 2 : 0;
                var slideProgress = (offsetCenter - slide.swiperSlideOffset - slideCenterOffset) / (slide.swiperSlideSize + s.params.spaceBetween);
                if (s.params.watchSlidesVisibility) {
                    var slideBefore = -(offsetCenter - slide.swiperSlideOffset - slideCenterOffset);
                    var slideAfter = slideBefore + s.slidesSizesGrid[i];
                    var isVisible = slideBefore >= 0 && slideBefore < s.size || slideAfter > 0 && slideAfter <= s.size || slideBefore <= 0 && slideAfter >= s.size;
                    if (isVisible) {
                        s.slides.eq(i).addClass(s.params.slideVisibleClass);
                    }
                }
                slide.progress = s.rtl ? -slideProgress : slideProgress;
            }
        };
        s.updateProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            var translatesDiff = s.maxTranslate() - s.minTranslate();
            if (translatesDiff === 0) {
                s.progress = 0;
                s.isBeginning = s.isEnd = true;
            } else {
                s.progress = (translate - s.minTranslate()) / translatesDiff;
                s.isBeginning = s.progress <= 0;
                s.isEnd = s.progress >= 1;
            }
            if (s.isBeginning)
                s.emit('onReachBeginning', s);
            if (s.isEnd)
                s.emit('onReachEnd', s);
            if (s.params.watchSlidesProgress)
                s.updateSlidesProgress(translate);
            s.emit('onProgress', s, s.progress);
        };
        s.updateActiveIndex = function () {
            var translate = s.rtl ? s.translate : -s.translate;
            var newActiveIndex, i, snapIndex;
            for (i = 0; i < s.slidesGrid.length; i++) {
                if (typeof s.slidesGrid[i + 1] !== 'undefined') {
                    if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1] - (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2) {
                        newActiveIndex = i;
                    } else if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1]) {
                        newActiveIndex = i + 1;
                    }
                } else {
                    if (translate >= s.slidesGrid[i]) {
                        newActiveIndex = i;
                    }
                }
            }
            if (newActiveIndex < 0 || typeof newActiveIndex === 'undefined')
                newActiveIndex = 0;
            snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
            if (snapIndex >= s.snapGrid.length)
                snapIndex = s.snapGrid.length - 1;
            if (newActiveIndex === s.activeIndex) {
                return;
            }
            s.snapIndex = snapIndex;
            s.previousIndex = s.activeIndex;
            s.activeIndex = newActiveIndex;
            s.updateClasses();
        };
        s.updateClasses = function () {
            s.slides.removeClass(s.params.slideActiveClass + ' ' + s.params.slideNextClass + ' ' + s.params.slidePrevClass);
            var activeSlide = s.slides.eq(s.activeIndex);
            activeSlide.addClass(s.params.slideActiveClass);
            activeSlide.next('.' + s.params.slideClass).addClass(s.params.slideNextClass);
            activeSlide.prev('.' + s.params.slideClass).addClass(s.params.slidePrevClass);
            if (s.bullets && s.bullets.length > 0) {
                s.bullets.removeClass(s.params.bulletActiveClass);
                var bulletIndex;
                if (s.params.loop) {
                    bulletIndex = Math.ceil(s.activeIndex - s.loopedSlides) / s.params.slidesPerGroup;
                    if (bulletIndex > s.slides.length - 1 - s.loopedSlides * 2) {
                        bulletIndex = bulletIndex - (s.slides.length - s.loopedSlides * 2);
                    }
                    if (bulletIndex > s.bullets.length - 1)
                        bulletIndex = bulletIndex - s.bullets.length;
                } else {
                    if (typeof s.snapIndex !== 'undefined') {
                        bulletIndex = s.snapIndex;
                    } else {
                        bulletIndex = s.activeIndex || 0;
                    }
                }
                if (s.paginationContainer.length > 1) {
                    s.bullets.each(function () {
                        if ($(this).index() === bulletIndex)
                            $(this).addClass(s.params.bulletActiveClass);
                    });
                } else {
                    s.bullets.eq(bulletIndex).addClass(s.params.bulletActiveClass);
                }
            }
            if (!s.params.loop) {
                if (s.params.prevButton) {
                    if (s.isBeginning) {
                        $(s.params.prevButton).addClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y)
                            s.a11y.disable($(s.params.prevButton));
                    } else {
                        $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y)
                            s.a11y.enable($(s.params.prevButton));
                    }
                }
                if (s.params.nextButton) {
                    if (s.isEnd) {
                        $(s.params.nextButton).addClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y)
                            s.a11y.disable($(s.params.nextButton));
                    } else {
                        $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y)
                            s.a11y.enable($(s.params.nextButton));
                    }
                }
            }
        };
        s.updatePagination = function () {
            if (!s.params.pagination)
                return;
            if (s.paginationContainer && s.paginationContainer.length > 0) {
                var bulletsHTML = '';
                var numberOfBullets = s.params.loop ? Math.ceil((s.slides.length - s.loopedSlides * 2) / s.params.slidesPerGroup) : s.snapGrid.length;
                for (var i = 0; i < numberOfBullets; i++) {
                    if (s.params.paginationBulletRender) {
                        bulletsHTML += s.params.paginationBulletRender(i, s.params.bulletClass);
                    } else {
                        bulletsHTML += '<span class="' + s.params.bulletClass + '"></span>';
                    }
                }
                s.paginationContainer.html(bulletsHTML);
                s.bullets = s.paginationContainer.find('.' + s.params.bulletClass);
            }
        };
        s.update = function (updateTranslate) {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            s.updatePagination();
            s.updateClasses();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            function forceSetTranslate() {
                newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            if (updateTranslate) {
                var translated, newTranslate;
                if (s.params.freeMode) {
                    forceSetTranslate();
                } else {
                    if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                        translated = s.slideTo(s.slides.length - 1, 0, false, true);
                    } else {
                        translated = s.slideTo(s.activeIndex, 0, false, true);
                    }
                    if (!translated) {
                        forceSetTranslate();
                    }
                }
            }
        };
        s.onResize = function (forceUpdatePagination) {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            if (s.params.slidesPerView === 'auto' || s.params.freeMode || forceUpdatePagination)
                s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.freeMode) {
                var newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            } else {
                s.updateClasses();
                if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                    s.slideTo(s.slides.length - 1, 0, false, true);
                } else {
                    s.slideTo(s.activeIndex, 0, false, true);
                }
            }
        };
        var desktopEvents = [
            'mousedown',
            'mousemove',
            'mouseup'
        ];
        if (window.navigator.pointerEnabled)
            desktopEvents = [
                'pointerdown',
                'pointermove',
                'pointerup'
            ];
        else if (window.navigator.msPointerEnabled)
            desktopEvents = [
                'MSPointerDown',
                'MSPointerMove',
                'MSPointerUp'
            ];
        s.touchEvents = {
            start: s.support.touch || !s.params.simulateTouch ? 'touchstart' : desktopEvents[0],
            move: s.support.touch || !s.params.simulateTouch ? 'touchmove' : desktopEvents[1],
            end: s.support.touch || !s.params.simulateTouch ? 'touchend' : desktopEvents[2]
        };
        if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
            (s.params.touchEventsTarget === 'container' ? s.container : s.wrapper).addClass('swiper-wp8-' + s.params.direction);
        }
        s.initEvents = function (detach) {
            var actionDom = detach ? 'off' : 'on';
            var action = detach ? 'removeEventListener' : 'addEventListener';
            var touchEventsTarget = s.params.touchEventsTarget === 'container' ? s.container[0] : s.wrapper[0];
            var target = s.support.touch ? touchEventsTarget : document;
            var moveCapture = s.params.nested ? true : false;
            if (s.browser.ie) {
                touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                target[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                target[action](s.touchEvents.end, s.onTouchEnd, false);
            } else {
                if (s.support.touch) {
                    touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                    touchEventsTarget[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                    touchEventsTarget[action](s.touchEvents.end, s.onTouchEnd, false);
                }
                if (params.simulateTouch && !s.device.ios && !s.device.android) {
                    touchEventsTarget[action]('mousedown', s.onTouchStart, false);
                    document[action]('mousemove', s.onTouchMove, moveCapture);
                    document[action]('mouseup', s.onTouchEnd, false);
                }
            }
            window[action]('resize', s.onResize);
            if (s.params.nextButton) {
                $(s.params.nextButton)[actionDom]('click', s.onClickNext);
                if (s.params.a11y && s.a11y)
                    $(s.params.nextButton)[actionDom]('keydown', s.a11y.onEnterKey);
            }
            if (s.params.prevButton) {
                $(s.params.prevButton)[actionDom]('click', s.onClickPrev);
                if (s.params.a11y && s.a11y)
                    $(s.params.prevButton)[actionDom]('keydown', s.a11y.onEnterKey);
            }
            if (s.params.pagination && s.params.paginationClickable) {
                $(s.paginationContainer)[actionDom]('click', '.' + s.params.bulletClass, s.onClickIndex);
            }
            if (s.params.preventClicks || s.params.preventClicksPropagation)
                touchEventsTarget[action]('click', s.preventClicks, true);
        };
        s.attachEvents = function (detach) {
            s.initEvents();
        };
        s.detachEvents = function () {
            s.initEvents(true);
        };
        s.allowClick = true;
        s.preventClicks = function (e) {
            if (!s.allowClick) {
                if (s.params.preventClicks)
                    e.preventDefault();
                if (s.params.preventClicksPropagation && s.animating) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        };
        s.onClickNext = function (e) {
            e.preventDefault();
            s.slideNext();
        };
        s.onClickPrev = function (e) {
            e.preventDefault();
            s.slidePrev();
        };
        s.onClickIndex = function (e) {
            e.preventDefault();
            var index = $(this).index() * s.params.slidesPerGroup;
            if (s.params.loop)
                index = index + s.loopedSlides;
            s.slideTo(index);
        };
        function findElementInEvent(e, selector) {
            var el = $(e.target);
            if (!el.is(selector)) {
                if (typeof selector === 'string') {
                    el = el.parents(selector);
                } else if (selector.nodeType) {
                    var found;
                    el.parents().each(function (index, _el) {
                        if (_el === selector)
                            found = selector;
                    });
                    if (!found)
                        return undefined;
                    else
                        return selector;
                }
            }
            if (el.length === 0) {
                return undefined;
            }
            return el[0];
        }
        s.updateClickedSlide = function (e) {
            var slide = findElementInEvent(e, '.' + s.params.slideClass);
            var slideFound = false;
            if (slide) {
                for (var i = 0; i < s.slides.length; i++) {
                    if (s.slides[i] === slide)
                        slideFound = true;
                }
            }
            if (slide && slideFound) {
                s.clickedSlide = slide;
                s.clickedIndex = $(slide).index();
            } else {
                s.clickedSlide = undefined;
                s.clickedIndex = undefined;
                return;
            }
            if (s.params.slideToClickedSlide && s.clickedIndex !== undefined && s.clickedIndex !== s.activeIndex) {
                var slideToIndex = s.clickedIndex, realIndex;
                if (s.params.loop) {
                    realIndex = $(s.clickedSlide).attr('data-swiper-slide-index');
                    if (slideToIndex > s.slides.length - s.params.slidesPerView) {
                        s.fixLoop();
                        slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]').eq(0).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    } else if (slideToIndex < s.params.slidesPerView - 1) {
                        s.fixLoop();
                        var duplicatedSlides = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]');
                        slideToIndex = duplicatedSlides.eq(duplicatedSlides.length - 1).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    } else {
                        s.slideTo(slideToIndex);
                    }
                } else {
                    s.slideTo(slideToIndex);
                }
            }
        };
        var isTouched, isMoved, touchStartTime, isScrolling, currentTranslate, startTranslate, allowThresholdMove, formElements = 'input, select, textarea, button', lastClickTime = Date.now(), clickTimeout, velocities = [], allowMomentumBounce;
        s.animating = false;
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
        };
        var isTouchEvent, startMoving;
        s.onTouchStart = function (e) {
            if (e.originalEvent)
                e = e.originalEvent;
            isTouchEvent = e.type === 'touchstart';
            if (!isTouchEvent && 'which' in e && e.which === 3)
                return;
            if (s.params.noSwiping && findElementInEvent(e, '.' + s.params.noSwipingClass)) {
                s.allowClick = true;
                return;
            }
            if (s.params.swipeHandler) {
                if (!findElementInEvent(e, s.params.swipeHandler))
                    return;
            }
            isTouched = true;
            isMoved = false;
            isScrolling = undefined;
            startMoving = undefined;
            s.touches.startX = s.touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.startY = s.touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
            touchStartTime = Date.now();
            s.allowClick = true;
            s.updateContainerSize();
            s.swipeDirection = undefined;
            if (s.params.threshold > 0)
                allowThresholdMove = false;
            if (e.type !== 'touchstart') {
                var preventDefault = true;
                if ($(e.target).is(formElements))
                    preventDefault = false;
                if (document.activeElement && $(document.activeElement).is(formElements)) {
                    document.activeElement.blur();
                }
                if (preventDefault) {
                    e.preventDefault();
                }
            }
            s.emit('onTouchStart', s, e);
        };
        s.onTouchMove = function (e) {
            if (e.originalEvent)
                e = e.originalEvent;
            if (isTouchEvent && e.type === 'mousemove')
                return;
            if (e.preventedByNestedSwiper)
                return;
            if (s.params.onlyExternal) {
                isMoved = true;
                s.allowClick = false;
                return;
            }
            if (isTouchEvent && document.activeElement) {
                if (e.target === document.activeElement && $(e.target).is(formElements)) {
                    isMoved = true;
                    s.allowClick = false;
                    return;
                }
            }
            s.emit('onTouchMove', s, e);
            if (e.targetTouches && e.targetTouches.length > 1)
                return;
            s.touches.currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
            if (typeof isScrolling === 'undefined') {
                var touchAngle = Math.atan2(Math.abs(s.touches.currentY - s.touches.startY), Math.abs(s.touches.currentX - s.touches.startX)) * 180 / Math.PI;
                isScrolling = isH() ? touchAngle > s.params.touchAngle : 90 - touchAngle > s.params.touchAngle;
            }
            if (isScrolling) {
                s.emit('onTouchMoveOpposite', s, e);
            }
            if (typeof startMoving === 'undefined' && s.browser.ieTouch) {
                if (s.touches.currentX !== s.touches.startX || s.touches.currentY !== s.touches.startY) {
                    startMoving = true;
                }
            }
            if (!isTouched)
                return;
            if (isScrolling) {
                isTouched = false;
                return;
            }
            if (!startMoving && s.browser.ieTouch) {
                return;
            }
            s.allowClick = false;
            s.emit('onSliderMove', s, e);
            e.preventDefault();
            if (s.params.touchMoveStopPropagation && !s.params.nested) {
                e.stopPropagation();
            }
            if (!isMoved) {
                if (params.loop) {
                    s.fixLoop();
                }
                startTranslate = s.getWrapperTranslate();
                s.setWrapperTransition(0);
                if (s.animating) {
                    s.wrapper.trigger('webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd');
                }
                if (s.params.autoplay && s.autoplaying) {
                    if (s.params.autoplayDisableOnInteraction) {
                        s.stopAutoplay();
                    } else {
                        s.pauseAutoplay();
                    }
                }
                allowMomentumBounce = false;
                if (s.params.grabCursor) {
                    s.container[0].style.cursor = 'move';
                    s.container[0].style.cursor = '-webkit-grabbing';
                    s.container[0].style.cursor = '-moz-grabbin';
                    s.container[0].style.cursor = 'grabbing';
                }
            }
            isMoved = true;
            var diff = s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
            diff = diff * s.params.touchRatio;
            if (s.rtl)
                diff = -diff;
            s.swipeDirection = diff > 0 ? 'prev' : 'next';
            currentTranslate = diff + startTranslate;
            var disableParentSwiper = true;
            if (diff > 0 && currentTranslate > s.minTranslate()) {
                disableParentSwiper = false;
                if (s.params.resistance)
                    currentTranslate = s.minTranslate() - 1 + Math.pow(-s.minTranslate() + startTranslate + diff, s.params.resistanceRatio);
            } else if (diff < 0 && currentTranslate < s.maxTranslate()) {
                disableParentSwiper = false;
                if (s.params.resistance)
                    currentTranslate = s.maxTranslate() + 1 - Math.pow(s.maxTranslate() - startTranslate - diff, s.params.resistanceRatio);
            }
            if (disableParentSwiper) {
                e.preventedByNestedSwiper = true;
            }
            if (!s.params.allowSwipeToNext && s.swipeDirection === 'next' && currentTranslate < startTranslate) {
                currentTranslate = startTranslate;
            }
            if (!s.params.allowSwipeToPrev && s.swipeDirection === 'prev' && currentTranslate > startTranslate) {
                currentTranslate = startTranslate;
            }
            if (!s.params.followFinger)
                return;
            if (s.params.threshold > 0) {
                if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = true;
                        s.touches.startX = s.touches.currentX;
                        s.touches.startY = s.touches.currentY;
                        currentTranslate = startTranslate;
                        s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
                        return;
                    }
                } else {
                    currentTranslate = startTranslate;
                    return;
                }
            }
            if (s.params.freeMode || s.params.watchSlidesProgress) {
                s.updateActiveIndex();
            }
            if (s.params.freeMode) {
                if (velocities.length === 0) {
                    velocities.push({
                        position: s.touches[isH() ? 'startX' : 'startY'],
                        time: touchStartTime
                    });
                }
                velocities.push({
                    position: s.touches[isH() ? 'currentX' : 'currentY'],
                    time: new window.Date().getTime()
                });
            }
            s.updateProgress(currentTranslate);
            s.setWrapperTranslate(currentTranslate);
        };
        s.onTouchEnd = function (e) {
            if (e.originalEvent)
                e = e.originalEvent;
            s.emit('onTouchEnd', s, e);
            if (!isTouched)
                return;
            if (s.params.grabCursor && isMoved && isTouched) {
                s.container[0].style.cursor = 'move';
                s.container[0].style.cursor = '-webkit-grab';
                s.container[0].style.cursor = '-moz-grab';
                s.container[0].style.cursor = 'grab';
            }
            var touchEndTime = Date.now();
            var timeDiff = touchEndTime - touchStartTime;
            if (s.allowClick) {
                s.updateClickedSlide(e);
                s.emit('onTap', s, e);
                if (timeDiff < 300 && touchEndTime - lastClickTime > 300) {
                    if (clickTimeout)
                        clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(function () {
                        if (!s)
                            return;
                        if (s.params.paginationHide && s.paginationContainer.length > 0 && !$(e.target).hasClass(s.params.bulletClass)) {
                            s.paginationContainer.toggleClass(s.params.paginationHiddenClass);
                        }
                        s.emit('onClick', s, e);
                    }, 300);
                }
                if (timeDiff < 300 && touchEndTime - lastClickTime < 300) {
                    if (clickTimeout)
                        clearTimeout(clickTimeout);
                    s.emit('onDoubleTap', s, e);
                }
            }
            lastClickTime = Date.now();
            setTimeout(function () {
                if (s)
                    s.allowClick = true;
            }, 0);
            if (!isTouched || !isMoved || !s.swipeDirection || s.touches.diff === 0 || currentTranslate === startTranslate) {
                isTouched = isMoved = false;
                return;
            }
            isTouched = isMoved = false;
            var currentPos;
            if (s.params.followFinger) {
                currentPos = s.rtl ? s.translate : -s.translate;
            } else {
                currentPos = -currentTranslate;
            }
            if (s.params.freeMode) {
                if (currentPos < -s.minTranslate()) {
                    s.slideTo(s.activeIndex);
                    return;
                } else if (currentPos > -s.maxTranslate()) {
                    if (s.slides.length < s.snapGrid.length) {
                        s.slideTo(s.snapGrid.length - 1);
                    } else {
                        s.slideTo(s.slides.length - 1);
                    }
                    return;
                }
                if (s.params.freeModeMomentum) {
                    if (velocities.length > 1) {
                        var lastMoveEvent = velocities.pop(), velocityEvent = velocities.pop();
                        var distance = lastMoveEvent.position - velocityEvent.position;
                        var time = lastMoveEvent.time - velocityEvent.time;
                        s.velocity = distance / time;
                        s.velocity = s.velocity / 2;
                        if (Math.abs(s.velocity) < 0.02) {
                            s.velocity = 0;
                        }
                        if (time > 150 || new window.Date().getTime() - lastMoveEvent.time > 300) {
                            s.velocity = 0;
                        }
                    } else {
                        s.velocity = 0;
                    }
                    velocities.length = 0;
                    var momentumDuration = 1000 * s.params.freeModeMomentumRatio;
                    var momentumDistance = s.velocity * momentumDuration;
                    var newPosition = s.translate + momentumDistance;
                    if (s.rtl)
                        newPosition = -newPosition;
                    var doBounce = false;
                    var afterBouncePosition;
                    var bounceAmount = Math.abs(s.velocity) * 20 * s.params.freeModeMomentumBounceRatio;
                    if (newPosition < s.maxTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition + s.maxTranslate() < -bounceAmount) {
                                newPosition = s.maxTranslate() - bounceAmount;
                            }
                            afterBouncePosition = s.maxTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        } else {
                            newPosition = s.maxTranslate();
                        }
                    } else if (newPosition > s.minTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition - s.minTranslate() > bounceAmount) {
                                newPosition = s.minTranslate() + bounceAmount;
                            }
                            afterBouncePosition = s.minTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        } else {
                            newPosition = s.minTranslate();
                        }
                    } else if (s.params.freeModeSticky) {
                        var j = 0, nextSlide;
                        for (j = 0; j < s.snapGrid.length; j += 1) {
                            if (s.snapGrid[j] > -newPosition) {
                                nextSlide = j;
                                break;
                            }
                        }
                        if (Math.abs(s.snapGrid[nextSlide] - newPosition) < Math.abs(s.snapGrid[nextSlide - 1] - newPosition) || s.swipeDirection === 'next') {
                            newPosition = s.snapGrid[nextSlide];
                        } else {
                            newPosition = s.snapGrid[nextSlide - 1];
                        }
                        if (!s.rtl)
                            newPosition = -newPosition;
                    }
                    if (s.velocity !== 0) {
                        if (s.rtl) {
                            momentumDuration = Math.abs((-newPosition - s.translate) / s.velocity);
                        } else {
                            momentumDuration = Math.abs((newPosition - s.translate) / s.velocity);
                        }
                    } else if (s.params.freeModeSticky) {
                        s.slideReset();
                        return;
                    }
                    if (s.params.freeModeMomentumBounce && doBounce) {
                        s.updateProgress(afterBouncePosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        s.animating = true;
                        s.wrapper.transitionEnd(function () {
                            if (!s || !allowMomentumBounce)
                                return;
                            s.emit('onMomentumBounce', s);
                            s.setWrapperTransition(s.params.speed);
                            s.setWrapperTranslate(afterBouncePosition);
                            s.wrapper.transitionEnd(function () {
                                if (!s)
                                    return;
                                s.onTransitionEnd();
                            });
                        });
                    } else if (s.velocity) {
                        s.updateProgress(newPosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        if (!s.animating) {
                            s.animating = true;
                            s.wrapper.transitionEnd(function () {
                                if (!s)
                                    return;
                                s.onTransitionEnd();
                            });
                        }
                    } else {
                        s.updateProgress(newPosition);
                    }
                    s.updateActiveIndex();
                }
                if (!s.params.freeModeMomentum || timeDiff >= s.params.longSwipesMs) {
                    s.updateProgress();
                    s.updateActiveIndex();
                }
                return;
            }
            var i, stopIndex = 0, groupSize = s.slidesSizesGrid[0];
            for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) {
                if (typeof s.slidesGrid[i + s.params.slidesPerGroup] !== 'undefined') {
                    if (currentPos >= s.slidesGrid[i] && currentPos < s.slidesGrid[i + s.params.slidesPerGroup]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[i + s.params.slidesPerGroup] - s.slidesGrid[i];
                    }
                } else {
                    if (currentPos >= s.slidesGrid[i]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[s.slidesGrid.length - 1] - s.slidesGrid[s.slidesGrid.length - 2];
                    }
                }
            }
            var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;
            if (timeDiff > s.params.longSwipesMs) {
                if (!s.params.longSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    if (ratio >= s.params.longSwipesRatio)
                        s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else
                        s.slideTo(stopIndex);
                }
                if (s.swipeDirection === 'prev') {
                    if (ratio > 1 - s.params.longSwipesRatio)
                        s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else
                        s.slideTo(stopIndex);
                }
            } else {
                if (!s.params.shortSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    s.slideTo(stopIndex + s.params.slidesPerGroup);
                }
                if (s.swipeDirection === 'prev') {
                    s.slideTo(stopIndex);
                }
            }
        };
        s._slideTo = function (slideIndex, speed) {
            return s.slideTo(slideIndex, speed, true, true);
        };
        s.slideTo = function (slideIndex, speed, runCallbacks, internal) {
            if (typeof runCallbacks === 'undefined')
                runCallbacks = true;
            if (typeof slideIndex === 'undefined')
                slideIndex = 0;
            if (slideIndex < 0)
                slideIndex = 0;
            s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
            if (s.snapIndex >= s.snapGrid.length)
                s.snapIndex = s.snapGrid.length - 1;
            var translate = -s.snapGrid[s.snapIndex];
            if (!s.params.allowSwipeToNext && translate < s.translate && translate < s.minTranslate()) {
                return false;
            }
            if (!s.params.allowSwipeToPrev && translate > s.translate && translate > s.maxTranslate()) {
                return false;
            }
            if (s.params.autoplay && s.autoplaying) {
                if (internal || !s.params.autoplayDisableOnInteraction) {
                    s.pauseAutoplay(speed);
                } else {
                    s.stopAutoplay();
                }
            }
            s.updateProgress(translate);
            for (var i = 0; i < s.slidesGrid.length; i++) {
                if (-translate >= s.slidesGrid[i]) {
                    slideIndex = i;
                }
            }
            if (typeof speed === 'undefined')
                speed = s.params.speed;
            s.previousIndex = s.activeIndex || 0;
            s.activeIndex = slideIndex;
            if (translate === s.translate) {
                s.updateClasses();
                return false;
            }
            s.updateClasses();
            s.onTransitionStart(runCallbacks);
            var translateX = isH() ? translate : 0, translateY = isH() ? 0 : translate;
            if (speed === 0) {
                s.setWrapperTransition(0);
                s.setWrapperTranslate(translate);
                s.onTransitionEnd(runCallbacks);
            } else {
                s.setWrapperTransition(speed);
                s.setWrapperTranslate(translate);
                if (!s.animating) {
                    s.animating = true;
                    s.wrapper.transitionEnd(function () {
                        if (!s)
                            return;
                        s.onTransitionEnd(runCallbacks);
                    });
                }
            }
            return true;
        };
        s.onTransitionStart = function (runCallbacks) {
            if (typeof runCallbacks === 'undefined')
                runCallbacks = true;
            if (s.lazy)
                s.lazy.onTransitionStart();
            if (runCallbacks) {
                s.emit('onTransitionStart', s);
                if (s.activeIndex !== s.previousIndex) {
                    s.emit('onSlideChangeStart', s);
                }
            }
        };
        s.onTransitionEnd = function (runCallbacks) {
            s.animating = false;
            s.setWrapperTransition(0);
            if (typeof runCallbacks === 'undefined')
                runCallbacks = true;
            if (s.lazy)
                s.lazy.onTransitionEnd();
            if (runCallbacks) {
                s.emit('onTransitionEnd', s);
                if (s.activeIndex !== s.previousIndex) {
                    s.emit('onSlideChangeEnd', s);
                }
            }
            if (s.params.hashnav && s.hashnav) {
                s.hashnav.setHash();
            }
        };
        s.slideNext = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating)
                    return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
            } else
                return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
        };
        s._slideNext = function (speed) {
            return s.slideNext(true, speed, true);
        };
        s.slidePrev = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating)
                    return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
            } else
                return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
        };
        s._slidePrev = function (speed) {
            return s.slidePrev(true, speed, true);
        };
        s.slideReset = function (runCallbacks, speed, internal) {
            return s.slideTo(s.activeIndex, speed, runCallbacks);
        };
        s.setWrapperTransition = function (duration, byController) {
            s.wrapper.transition(duration);
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTransition(duration);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTransition(duration);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTransition(duration);
            }
            if (s.params.control && s.controller) {
                s.controller.setTransition(duration, byController);
            }
            s.emit('onSetTransition', s, duration);
        };
        s.setWrapperTranslate = function (translate, updateActiveIndex, byController) {
            var x = 0, y = 0, z = 0;
            if (isH()) {
                x = s.rtl ? -translate : translate;
            } else {
                y = translate;
            }
            if (!s.params.virtualTranslate) {
                if (s.support.transforms3d)
                    s.wrapper.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
                else
                    s.wrapper.transform('translate(' + x + 'px, ' + y + 'px)');
            }
            s.translate = isH() ? x : y;
            if (updateActiveIndex)
                s.updateActiveIndex();
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTranslate(s.translate);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTranslate(s.translate);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTranslate(s.translate);
            }
            if (s.params.control && s.controller) {
                s.controller.setTranslate(s.translate, byController);
            }
            s.emit('onSetTranslate', s, s.translate);
        };
        s.getTranslate = function (el, axis) {
            var matrix, curTransform, curStyle, transformMatrix;
            if (typeof axis === 'undefined') {
                axis = 'x';
            }
            if (s.params.virtualTranslate) {
                return s.rtl ? -s.translate : s.translate;
            }
            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                transformMatrix = new window.WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
            } else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }
            if (axis === 'x') {
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                else
                    curTransform = parseFloat(matrix[5]);
            }
            if (s.rtl && curTransform)
                curTransform = -curTransform;
            return curTransform || 0;
        };
        s.getWrapperTranslate = function (axis) {
            if (typeof axis === 'undefined') {
                axis = isH() ? 'x' : 'y';
            }
            return s.getTranslate(s.wrapper[0], axis);
        };
        s.observers = [];
        function initObserver(target, options) {
            options = options || {};
            var ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            var observer = new ObserverFunc(function (mutations) {
                mutations.forEach(function (mutation) {
                    s.onResize(true);
                    s.emit('onObserverUpdate', s, mutation);
                });
            });
            observer.observe(target, {
                attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
                childList: typeof options.childList === 'undefined' ? true : options.childList,
                characterData: typeof options.characterData === 'undefined' ? true : options.characterData
            });
            s.observers.push(observer);
        }
        s.initObservers = function () {
            if (s.params.observeParents) {
                var containerParents = s.container.parents();
                for (var i = 0; i < containerParents.length; i++) {
                    initObserver(containerParents[i]);
                }
            }
            initObserver(s.container[0], { childList: false });
            initObserver(s.wrapper[0], { attributes: false });
        };
        s.disconnectObservers = function () {
            for (var i = 0; i < s.observers.length; i++) {
                s.observers[i].disconnect();
            }
            s.observers = [];
        };
        s.createLoop = function () {
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
            var slides = s.wrapper.children('.' + s.params.slideClass);
            s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
            s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
            if (s.loopedSlides > slides.length) {
                s.loopedSlides = slides.length;
            }
            var prependSlides = [], appendSlides = [], i;
            slides.each(function (index, el) {
                var slide = $(this);
                if (index < s.loopedSlides)
                    appendSlides.push(el);
                if (index < slides.length && index >= slides.length - s.loopedSlides)
                    prependSlides.push(el);
                slide.attr('data-swiper-slide-index', index);
            });
            for (i = 0; i < appendSlides.length; i++) {
                s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
            for (i = prependSlides.length - 1; i >= 0; i--) {
                s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
        };
        s.destroyLoop = function () {
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
            s.slides.removeAttr('data-swiper-slide-index');
        };
        s.fixLoop = function () {
            var newIndex;
            if (s.activeIndex < s.loopedSlides) {
                newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            } else if (s.params.slidesPerView === 'auto' && s.activeIndex >= s.loopedSlides * 2 || s.activeIndex > s.slides.length - s.params.slidesPerView * 2) {
                newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
        };
        s.appendSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i])
                        s.wrapper.append(slides[i]);
                }
            } else {
                s.wrapper.append(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
        };
        s.prependSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex + 1;
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i])
                        s.wrapper.prepend(slides[i]);
                }
                newActiveIndex = s.activeIndex + slides.length;
            } else {
                s.wrapper.prepend(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeSlide = function (slidesIndexes) {
            if (s.params.loop) {
                s.destroyLoop();
                s.slides = s.wrapper.children('.' + s.params.slideClass);
            }
            var newActiveIndex = s.activeIndex, indexToRemove;
            if (typeof slidesIndexes === 'object' && slidesIndexes.length) {
                for (var i = 0; i < slidesIndexes.length; i++) {
                    indexToRemove = slidesIndexes[i];
                    if (s.slides[indexToRemove])
                        s.slides.eq(indexToRemove).remove();
                    if (indexToRemove < newActiveIndex)
                        newActiveIndex--;
                }
                newActiveIndex = Math.max(newActiveIndex, 0);
            } else {
                indexToRemove = slidesIndexes;
                if (s.slides[indexToRemove])
                    s.slides.eq(indexToRemove).remove();
                if (indexToRemove < newActiveIndex)
                    newActiveIndex--;
                newActiveIndex = Math.max(newActiveIndex, 0);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            if (s.params.loop) {
                s.slideTo(newActiveIndex + s.loopedSlides, 0, false);
            } else {
                s.slideTo(newActiveIndex, 0, false);
            }
        };
        s.removeAllSlides = function () {
            var slidesIndexes = [];
            for (var i = 0; i < s.slides.length; i++) {
                slidesIndexes.push(i);
            }
            s.removeSlide(slidesIndexes);
        };
        s.effects = {
            fade: {
                setTranslate: function () {
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var offset = slide[0].swiperSlideOffset;
                        var tx = -offset;
                        if (!s.params.virtualTranslate)
                            tx = tx - s.translate;
                        var ty = 0;
                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }
                        var slideOpacity = s.params.fade.crossFade ? Math.max(1 - Math.abs(slide[0].progress), 0) : 1 + Math.min(Math.max(slide[0].progress, -1), 0);
                        slide.css({ opacity: slideOpacity }).transform('translate3d(' + tx + 'px, ' + ty + 'px, 0px)');
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration);
                    if (s.params.virtualTranslate && duration !== 0) {
                        var eventTriggered = false;
                        s.slides.transitionEnd(function () {
                            if (eventTriggered)
                                return;
                            if (!s)
                                return;
                            eventTriggered = true;
                            s.animating = false;
                            var triggerEvents = [
                                'webkitTransitionEnd',
                                'transitionend',
                                'oTransitionEnd',
                                'MSTransitionEnd',
                                'msTransitionEnd'
                            ];
                            for (var i = 0; i < triggerEvents.length; i++) {
                                s.wrapper.trigger(triggerEvents[i]);
                            }
                        });
                    }
                }
            },
            cube: {
                setTranslate: function () {
                    var wrapperRotate = 0, cubeShadow;
                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow = s.wrapper.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.wrapper.append(cubeShadow);
                            }
                            cubeShadow.css({ height: s.width + 'px' });
                        } else {
                            cubeShadow = s.container.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.container.append(cubeShadow);
                            }
                        }
                    }
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var slideAngle = i * 90;
                        var round = Math.floor(slideAngle / 360);
                        if (s.rtl) {
                            slideAngle = -slideAngle;
                            round = Math.floor(-slideAngle / 360);
                        }
                        var progress = Math.max(Math.min(slide[0].progress, 1), -1);
                        var tx = 0, ty = 0, tz = 0;
                        if (i % 4 === 0) {
                            tx = -round * 4 * s.size;
                            tz = 0;
                        } else if ((i - 1) % 4 === 0) {
                            tx = 0;
                            tz = -round * 4 * s.size;
                        } else if ((i - 2) % 4 === 0) {
                            tx = s.size + round * 4 * s.size;
                            tz = s.size;
                        } else if ((i - 3) % 4 === 0) {
                            tx = -s.size;
                            tz = 3 * s.size + s.size * 4 * round;
                        }
                        if (s.rtl) {
                            tx = -tx;
                        }
                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }
                        var transform = 'rotateX(' + (isH() ? 0 : -slideAngle) + 'deg) rotateY(' + (isH() ? slideAngle : 0) + 'deg) translate3d(' + tx + 'px, ' + ty + 'px, ' + tz + 'px)';
                        if (progress <= 1 && progress > -1) {
                            wrapperRotate = i * 90 + progress * 90;
                            if (s.rtl)
                                wrapperRotate = -i * 90 - progress * 90;
                        }
                        slide.transform(transform);
                        if (s.params.cube.slideShadows) {
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            var shadowOpacity = slide[0].progress;
                            if (shadowBefore.length)
                                shadowBefore[0].style.opacity = -slide[0].progress;
                            if (shadowAfter.length)
                                shadowAfter[0].style.opacity = slide[0].progress;
                        }
                    }
                    s.wrapper.css({
                        '-webkit-transform-origin': '50% 50% -' + s.size / 2 + 'px',
                        '-moz-transform-origin': '50% 50% -' + s.size / 2 + 'px',
                        '-ms-transform-origin': '50% 50% -' + s.size / 2 + 'px',
                        'transform-origin': '50% 50% -' + s.size / 2 + 'px'
                    });
                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow.transform('translate3d(0px, ' + (s.width / 2 + s.params.cube.shadowOffset) + 'px, ' + -s.width / 2 + 'px) rotateX(90deg) rotateZ(0deg) scale(' + s.params.cube.shadowScale + ')');
                        } else {
                            var shadowAngle = Math.abs(wrapperRotate) - Math.floor(Math.abs(wrapperRotate) / 90) * 90;
                            var multiplier = 1.5 - (Math.sin(shadowAngle * 2 * Math.PI / 360) / 2 + Math.cos(shadowAngle * 2 * Math.PI / 360) / 2);
                            var scale1 = s.params.cube.shadowScale, scale2 = s.params.cube.shadowScale / multiplier, offset = s.params.cube.shadowOffset;
                            cubeShadow.transform('scale3d(' + scale1 + ', 1, ' + scale2 + ') translate3d(0px, ' + (s.height / 2 + offset) + 'px, ' + -s.height / 2 / scale2 + 'px) rotateX(-90deg)');
                        }
                    }
                    var zFactor = s.isSafari || s.isUiWebView ? -s.size / 2 : 0;
                    s.wrapper.transform('translate3d(0px,0,' + zFactor + 'px) rotateX(' + (isH() ? 0 : wrapperRotate) + 'deg) rotateY(' + (isH() ? -wrapperRotate : 0) + 'deg)');
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                    if (s.params.cube.shadow && !isH()) {
                        s.container.find('.swiper-cube-shadow').transition(duration);
                    }
                }
            },
            coverflow: {
                setTranslate: function () {
                    var transform = s.translate;
                    var center = isH() ? -transform + s.width / 2 : -transform + s.height / 2;
                    var rotate = isH() ? s.params.coverflow.rotate : -s.params.coverflow.rotate;
                    var translate = s.params.coverflow.depth;
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        var slideSize = s.slidesSizesGrid[i];
                        var slideOffset = slide[0].swiperSlideOffset;
                        var offsetMultiplier = (center - slideOffset - slideSize / 2) / slideSize * s.params.coverflow.modifier;
                        var rotateY = isH() ? rotate * offsetMultiplier : 0;
                        var rotateX = isH() ? 0 : rotate * offsetMultiplier;
                        var translateZ = -translate * Math.abs(offsetMultiplier);
                        var translateY = isH() ? 0 : s.params.coverflow.stretch * offsetMultiplier;
                        var translateX = isH() ? s.params.coverflow.stretch * offsetMultiplier : 0;
                        if (Math.abs(translateX) < 0.001)
                            translateX = 0;
                        if (Math.abs(translateY) < 0.001)
                            translateY = 0;
                        if (Math.abs(translateZ) < 0.001)
                            translateZ = 0;
                        if (Math.abs(rotateY) < 0.001)
                            rotateY = 0;
                        if (Math.abs(rotateX) < 0.001)
                            rotateX = 0;
                        var slideTransform = 'translate3d(' + translateX + 'px,' + translateY + 'px,' + translateZ + 'px)  rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
                        slide.transform(slideTransform);
                        slide[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
                        if (s.params.coverflow.slideShadows) {
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length)
                                shadowBefore[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
                            if (shadowAfter.length)
                                shadowAfter[0].style.opacity = -offsetMultiplier > 0 ? -offsetMultiplier : 0;
                        }
                    }
                    if (s.browser.ie) {
                        var ws = s.wrapper[0].style;
                        ws.perspectiveOrigin = center + 'px 50%';
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                }
            }
        };
        s.lazy = {
            initialImageLoaded: false,
            loadImageInSlide: function (index, loadInDuplicate) {
                if (typeof index === 'undefined')
                    return;
                if (typeof loadInDuplicate === 'undefined')
                    loadInDuplicate = true;
                if (s.slides.length === 0)
                    return;
                var slide = s.slides.eq(index);
                var img = slide.find('.swiper-lazy:not(.swiper-lazy-loaded):not(.swiper-lazy-loading)');
                if (slide.hasClass('swiper-lazy') && !slide.hasClass('swiper-lazy-loaded') && !slide.hasClass('swiper-lazy-loading')) {
                    img.add(slide[0]);
                }
                if (img.length === 0)
                    return;
                img.each(function () {
                    var _img = $(this);
                    _img.addClass('swiper-lazy-loading');
                    var background = _img.attr('data-background');
                    var src = _img.attr('data-src');
                    s.loadImage(_img[0], src || background, false, function () {
                        if (background) {
                            _img.css('background-image', 'url(' + background + ')');
                            _img.removeAttr('data-background');
                        } else {
                            _img.attr('src', src);
                            _img.removeAttr('data-src');
                        }
                        _img.addClass('swiper-lazy-loaded').removeClass('swiper-lazy-loading');
                        slide.find('.swiper-lazy-preloader, .preloader').remove();
                        if (s.params.loop && loadInDuplicate) {
                            var slideOriginalIndex = slide.attr('data-swiper-slide-index');
                            if (slide.hasClass(s.params.slideDuplicateClass)) {
                                var originalSlide = s.wrapper.children('[data-swiper-slide-index="' + slideOriginalIndex + '"]:not(.' + s.params.slideDuplicateClass + ')');
                                s.lazy.loadImageInSlide(originalSlide.index(), false);
                            } else {
                                var duplicatedSlide = s.wrapper.children('.' + s.params.slideDuplicateClass + '[data-swiper-slide-index="' + slideOriginalIndex + '"]');
                                s.lazy.loadImageInSlide(duplicatedSlide.index(), false);
                            }
                        }
                        s.emit('onLazyImageReady', s, slide[0], _img[0]);
                    });
                    s.emit('onLazyImageLoad', s, slide[0], _img[0]);
                });
            },
            load: function () {
                var i;
                if (s.params.watchSlidesVisibility) {
                    s.wrapper.children('.' + s.params.slideVisibleClass).each(function () {
                        s.lazy.loadImageInSlide($(this).index());
                    });
                } else {
                    if (s.params.slidesPerView > 1) {
                        for (i = s.activeIndex; i < s.activeIndex + s.params.slidesPerView; i++) {
                            if (s.slides[i])
                                s.lazy.loadImageInSlide(i);
                        }
                    } else {
                        s.lazy.loadImageInSlide(s.activeIndex);
                    }
                }
                if (s.params.lazyLoadingInPrevNext) {
                    if (s.params.slidesPerView > 1) {
                        for (i = s.activeIndex + s.params.slidesPerView; i < s.activeIndex + s.params.slidesPerView + s.params.slidesPerView; i++) {
                            if (s.slides[i])
                                s.lazy.loadImageInSlide(i);
                        }
                        for (i = s.activeIndex - s.params.slidesPerView; i < s.activeIndex; i++) {
                            if (s.slides[i])
                                s.lazy.loadImageInSlide(i);
                        }
                    } else {
                        var nextSlide = s.wrapper.children('.' + s.params.slideNextClass);
                        if (nextSlide.length > 0)
                            s.lazy.loadImageInSlide(nextSlide.index());
                        var prevSlide = s.wrapper.children('.' + s.params.slidePrevClass);
                        if (prevSlide.length > 0)
                            s.lazy.loadImageInSlide(prevSlide.index());
                    }
                }
            },
            onTransitionStart: function () {
                if (s.params.lazyLoading) {
                    if (s.params.lazyLoadingOnTransitionStart || !s.params.lazyLoadingOnTransitionStart && !s.lazy.initialImageLoaded) {
                        s.lazy.load();
                    }
                }
            },
            onTransitionEnd: function () {
                if (s.params.lazyLoading && !s.params.lazyLoadingOnTransitionStart) {
                    s.lazy.load();
                }
            }
        };
        s.scrollbar = {
            set: function () {
                if (!s.params.scrollbar)
                    return;
                var sb = s.scrollbar;
                sb.track = $(s.params.scrollbar);
                sb.drag = sb.track.find('.swiper-scrollbar-drag');
                if (sb.drag.length === 0) {
                    sb.drag = $('<div class="swiper-scrollbar-drag"></div>');
                    sb.track.append(sb.drag);
                }
                sb.drag[0].style.width = '';
                sb.drag[0].style.height = '';
                sb.trackSize = isH() ? sb.track[0].offsetWidth : sb.track[0].offsetHeight;
                sb.divider = s.size / s.virtualSize;
                sb.moveDivider = sb.divider * (sb.trackSize / s.size);
                sb.dragSize = sb.trackSize * sb.divider;
                if (isH()) {
                    sb.drag[0].style.width = sb.dragSize + 'px';
                } else {
                    sb.drag[0].style.height = sb.dragSize + 'px';
                }
                if (sb.divider >= 1) {
                    sb.track[0].style.display = 'none';
                } else {
                    sb.track[0].style.display = '';
                }
                if (s.params.scrollbarHide) {
                    sb.track[0].style.opacity = 0;
                }
            },
            setTranslate: function () {
                if (!s.params.scrollbar)
                    return;
                var diff;
                var sb = s.scrollbar;
                var translate = s.translate || 0;
                var newPos;
                var newSize = sb.dragSize;
                newPos = (sb.trackSize - sb.dragSize) * s.progress;
                if (s.rtl && isH()) {
                    newPos = -newPos;
                    if (newPos > 0) {
                        newSize = sb.dragSize - newPos;
                        newPos = 0;
                    } else if (-newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize + newPos;
                    }
                } else {
                    if (newPos < 0) {
                        newSize = sb.dragSize + newPos;
                        newPos = 0;
                    } else if (newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize - newPos;
                    }
                }
                if (isH()) {
                    if (s.support.transforms3d) {
                        sb.drag.transform('translate3d(' + newPos + 'px, 0, 0)');
                    } else {
                        sb.drag.transform('translateX(' + newPos + 'px)');
                    }
                    sb.drag[0].style.width = newSize + 'px';
                } else {
                    if (s.support.transforms3d) {
                        sb.drag.transform('translate3d(0px, ' + newPos + 'px, 0)');
                    } else {
                        sb.drag.transform('translateY(' + newPos + 'px)');
                    }
                    sb.drag[0].style.height = newSize + 'px';
                }
                if (s.params.scrollbarHide) {
                    clearTimeout(sb.timeout);
                    sb.track[0].style.opacity = 1;
                    sb.timeout = setTimeout(function () {
                        sb.track[0].style.opacity = 0;
                        sb.track.transition(400);
                    }, 1000);
                }
            },
            setTransition: function (duration) {
                if (!s.params.scrollbar)
                    return;
                s.scrollbar.drag.transition(duration);
            }
        };
        s.controller = {
            setTranslate: function (translate, byController) {
                var controlled = s.params.control;
                var multiplier, controlledTranslate;
                function setControlledTranslate(c) {
                    translate = c.rtl && c.params.direction === 'horizontal' ? -s.translate : s.translate;
                    multiplier = (c.maxTranslate() - c.minTranslate()) / (s.maxTranslate() - s.minTranslate());
                    controlledTranslate = (translate - s.minTranslate()) * multiplier + c.minTranslate();
                    if (s.params.controlInverse) {
                        controlledTranslate = c.maxTranslate() - controlledTranslate;
                    }
                    c.updateProgress(controlledTranslate);
                    c.setWrapperTranslate(controlledTranslate, false, s);
                    c.updateActiveIndex();
                }
                if (s.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            setControlledTranslate(controlled[i]);
                        }
                    }
                } else if (controlled instanceof Swiper && byController !== controlled) {
                    setControlledTranslate(controlled);
                }
            },
            setTransition: function (duration, byController) {
                var controlled = s.params.control;
                var i;
                function setControlledTransition(c) {
                    c.setWrapperTransition(duration, s);
                    if (duration !== 0) {
                        c.onTransitionStart();
                        c.wrapper.transitionEnd(function () {
                            if (!controlled)
                                return;
                            c.onTransitionEnd();
                        });
                    }
                }
                if (s.isArray(controlled)) {
                    for (i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            setControlledTransition(controlled[i]);
                        }
                    }
                } else if (controlled instanceof Swiper && byController !== controlled) {
                    setControlledTransition(controlled);
                }
            }
        };
        s.hashnav = {
            init: function () {
                if (!s.params.hashnav)
                    return;
                s.hashnav.initialized = true;
                var hash = document.location.hash.replace('#', '');
                if (!hash)
                    return;
                var speed = 0;
                for (var i = 0, length = s.slides.length; i < length; i++) {
                    var slide = s.slides.eq(i);
                    var slideHash = slide.attr('data-hash');
                    if (slideHash === hash && !slide.hasClass(s.params.slideDuplicateClass)) {
                        var index = slide.index();
                        s.slideTo(index, speed, s.params.runCallbacksOnInit, true);
                    }
                }
            },
            setHash: function () {
                if (!s.hashnav.initialized || !s.params.hashnav)
                    return;
                document.location.hash = s.slides.eq(s.activeIndex).attr('data-hash') || '';
            }
        };
        function handleKeyboard(e) {
            if (e.originalEvent)
                e = e.originalEvent;
            var kc = e.keyCode || e.charCode;
            if (!s.params.allowSwipeToNext && (isH() && kc === 39 || !isH() && kc === 40)) {
                return false;
            }
            if (!s.params.allowSwipeToPrev && (isH() && kc === 37 || !isH() && kc === 38)) {
                return false;
            }
            if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
                return;
            }
            if (document.activeElement && document.activeElement.nodeName && (document.activeElement.nodeName.toLowerCase() === 'input' || document.activeElement.nodeName.toLowerCase() === 'textarea')) {
                return;
            }
            if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
                var inView = false;
                if (s.container.parents('.swiper-slide').length > 0 && s.container.parents('.swiper-slide-active').length === 0) {
                    return;
                }
                var windowScroll = {
                    left: window.pageXOffset,
                    top: window.pageYOffset
                };
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var swiperOffset = s.container.offset();
                if (s.rtl)
                    swiperOffset.left = swiperOffset.left - s.container[0].scrollLeft;
                var swiperCoord = [
                    [
                        swiperOffset.left,
                        swiperOffset.top
                    ],
                    [
                        swiperOffset.left + s.width,
                        swiperOffset.top
                    ],
                    [
                        swiperOffset.left,
                        swiperOffset.top + s.height
                    ],
                    [
                        swiperOffset.left + s.width,
                        swiperOffset.top + s.height
                    ]
                ];
                for (var i = 0; i < swiperCoord.length; i++) {
                    var point = swiperCoord[i];
                    if (point[0] >= windowScroll.left && point[0] <= windowScroll.left + windowWidth && point[1] >= windowScroll.top && point[1] <= windowScroll.top + windowHeight) {
                        inView = true;
                    }
                }
                if (!inView)
                    return;
            }
            if (isH()) {
                if (kc === 37 || kc === 39) {
                    if (e.preventDefault)
                        e.preventDefault();
                    else
                        e.returnValue = false;
                }
                if (kc === 39 && !s.rtl || kc === 37 && s.rtl)
                    s.slideNext();
                if (kc === 37 && !s.rtl || kc === 39 && s.rtl)
                    s.slidePrev();
            } else {
                if (kc === 38 || kc === 40) {
                    if (e.preventDefault)
                        e.preventDefault();
                    else
                        e.returnValue = false;
                }
                if (kc === 40)
                    s.slideNext();
                if (kc === 38)
                    s.slidePrev();
            }
        }
        s.disableKeyboardControl = function () {
            $(document).off('keydown', handleKeyboard);
        };
        s.enableKeyboardControl = function () {
            $(document).on('keydown', handleKeyboard);
        };
        s.mousewheel = {
            event: false,
            lastScrollTime: new window.Date().getTime()
        };
        if (s.params.mousewheelControl) {
            if (document.onmousewheel !== undefined) {
                s.mousewheel.event = 'mousewheel';
            }
            if (!s.mousewheel.event) {
                try {
                    new window.WheelEvent('wheel');
                    s.mousewheel.event = 'wheel';
                } catch (e) {
                }
            }
            if (!s.mousewheel.event) {
                s.mousewheel.event = 'DOMMouseScroll';
            }
        }
        function handleMousewheel(e) {
            if (e.originalEvent)
                e = e.originalEvent;
            var we = s.mousewheel.event;
            var delta = 0;
            if (e.detail)
                delta = -e.detail;
            else if (we === 'mousewheel') {
                if (s.params.mousewheelForceToAxis) {
                    if (isH()) {
                        if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY))
                            delta = e.wheelDeltaX;
                        else
                            return;
                    } else {
                        if (Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX))
                            delta = e.wheelDeltaY;
                        else
                            return;
                    }
                } else {
                    delta = e.wheelDelta;
                }
            } else if (we === 'DOMMouseScroll')
                delta = -e.detail;
            else if (we === 'wheel') {
                if (s.params.mousewheelForceToAxis) {
                    if (isH()) {
                        if (Math.abs(e.deltaX) > Math.abs(e.deltaY))
                            delta = -e.deltaX;
                        else
                            return;
                    } else {
                        if (Math.abs(e.deltaY) > Math.abs(e.deltaX))
                            delta = -e.deltaY;
                        else
                            return;
                    }
                } else {
                    delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? -e.deltaX : -e.deltaY;
                }
            }
            if (s.params.mousewheelInvert)
                delta = -delta;
            if (!s.params.freeMode) {
                if (new window.Date().getTime() - s.mousewheel.lastScrollTime > 60) {
                    if (delta < 0) {
                        if (!s.isEnd)
                            s.slideNext();
                        else if (s.params.mousewheelReleaseOnEdges)
                            return true;
                    } else {
                        if (!s.isBeginning)
                            s.slidePrev();
                        else if (s.params.mousewheelReleaseOnEdges)
                            return true;
                    }
                }
                s.mousewheel.lastScrollTime = new window.Date().getTime();
            } else {
                var position = s.getWrapperTranslate() + delta;
                if (position > 0)
                    position = 0;
                if (position < s.maxTranslate())
                    position = s.maxTranslate();
                s.setWrapperTransition(0);
                s.setWrapperTranslate(position);
                s.updateProgress();
                s.updateActiveIndex();
                if (s.params.freeModeSticky) {
                    clearTimeout(s.mousewheel.timeout);
                    s.mousewheel.timeout = setTimeout(function () {
                        s.slideReset();
                    }, 300);
                }
                if (position === 0 || position === s.maxTranslate())
                    return;
            }
            if (s.params.autoplay)
                s.stopAutoplay();
            if (e.preventDefault)
                e.preventDefault();
            else
                e.returnValue = false;
            return false;
        }
        s.disableMousewheelControl = function () {
            if (!s.mousewheel.event)
                return false;
            s.container.off(s.mousewheel.event, handleMousewheel);
            return true;
        };
        s.enableMousewheelControl = function () {
            if (!s.mousewheel.event)
                return false;
            s.container.on(s.mousewheel.event, handleMousewheel);
            return true;
        };
        function setParallaxTransform(el, progress) {
            el = $(el);
            var p, pX, pY;
            p = el.attr('data-swiper-parallax') || '0';
            pX = el.attr('data-swiper-parallax-x');
            pY = el.attr('data-swiper-parallax-y');
            if (pX || pY) {
                pX = pX || '0';
                pY = pY || '0';
            } else {
                if (isH()) {
                    pX = p;
                    pY = '0';
                } else {
                    pY = p;
                    pX = '0';
                }
            }
            if (pX.indexOf('%') >= 0) {
                pX = parseInt(pX, 10) * progress + '%';
            } else {
                pX = pX * progress + 'px';
            }
            if (pY.indexOf('%') >= 0) {
                pY = parseInt(pY, 10) * progress + '%';
            } else {
                pY = pY * progress + 'px';
            }
            el.transform('translate3d(' + pX + ', ' + pY + ',0px)');
        }
        s.parallax = {
            setTranslate: function () {
                s.container.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function () {
                    setParallaxTransform(this, s.progress);
                });
                s.slides.each(function () {
                    var slide = $(this);
                    slide.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function () {
                        var progress = Math.min(Math.max(slide[0].progress, -1), 1);
                        setParallaxTransform(this, progress);
                    });
                });
            },
            setTransition: function (duration) {
                if (typeof duration === 'undefined')
                    duration = s.params.speed;
                s.container.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function () {
                    var el = $(this);
                    var parallaxDuration = parseInt(el.attr('data-swiper-parallax-duration'), 10) || duration;
                    if (duration === 0)
                        parallaxDuration = 0;
                    el.transition(parallaxDuration);
                });
            }
        };
        s._plugins = [];
        for (var plugin in s.plugins) {
            var p = s.plugins[plugin](s, s.params[plugin]);
            if (p)
                s._plugins.push(p);
        }
        s.callPlugins = function (eventName) {
            for (var i = 0; i < s._plugins.length; i++) {
                if (eventName in s._plugins[i]) {
                    s._plugins[i][eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                }
            }
        };
        function normalizeEventName(eventName) {
            if (eventName.indexOf('on') !== 0) {
                if (eventName[0] !== eventName[0].toUpperCase()) {
                    eventName = 'on' + eventName[0].toUpperCase() + eventName.substring(1);
                } else {
                    eventName = 'on' + eventName;
                }
            }
            return eventName;
        }
        s.emitterEventListeners = {};
        s.emit = function (eventName) {
            if (s.params[eventName]) {
                s.params[eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
            }
            var i;
            if (s.emitterEventListeners[eventName]) {
                for (i = 0; i < s.emitterEventListeners[eventName].length; i++) {
                    s.emitterEventListeners[eventName][i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                }
            }
            if (s.callPlugins)
                s.callPlugins(eventName, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        };
        s.on = function (eventName, handler) {
            eventName = normalizeEventName(eventName);
            if (!s.emitterEventListeners[eventName])
                s.emitterEventListeners[eventName] = [];
            s.emitterEventListeners[eventName].push(handler);
            return s;
        };
        s.off = function (eventName, handler) {
            var i;
            eventName = normalizeEventName(eventName);
            if (typeof handler === 'undefined') {
                s.emitterEventListeners[eventName] = [];
                return s;
            }
            if (!s.emitterEventListeners[eventName] || s.emitterEventListeners[eventName].length === 0)
                return;
            for (i = 0; i < s.emitterEventListeners[eventName].length; i++) {
                if (s.emitterEventListeners[eventName][i] === handler)
                    s.emitterEventListeners[eventName].splice(i, 1);
            }
            return s;
        };
        s.once = function (eventName, handler) {
            eventName = normalizeEventName(eventName);
            var _handler = function () {
                handler(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                s.off(eventName, _handler);
            };
            s.on(eventName, _handler);
            return s;
        };
        s.a11y = {
            makeFocusable: function ($el) {
                $el[0].tabIndex = '0';
                return $el;
            },
            addRole: function ($el, role) {
                $el.attr('role', role);
                return $el;
            },
            addLabel: function ($el, label) {
                $el.attr('aria-label', label);
                return $el;
            },
            disable: function ($el) {
                $el.attr('aria-disabled', true);
                return $el;
            },
            enable: function ($el) {
                $el.attr('aria-disabled', false);
                return $el;
            },
            onEnterKey: function (event) {
                if (event.keyCode !== 13)
                    return;
                if ($(event.target).is(s.params.nextButton)) {
                    s.onClickNext(event);
                    if (s.isEnd) {
                        s.a11y.notify(s.params.lastSlideMsg);
                    } else {
                        s.a11y.notify(s.params.nextSlideMsg);
                    }
                } else if ($(event.target).is(s.params.prevButton)) {
                    s.onClickPrev(event);
                    if (s.isBeginning) {
                        s.a11y.notify(s.params.firstSlideMsg);
                    } else {
                        s.a11y.notify(s.params.prevSlideMsg);
                    }
                }
            },
            liveRegion: $('<span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>'),
            notify: function (message) {
                var notification = s.a11y.liveRegion;
                if (notification.length === 0)
                    return;
                notification.html('');
                notification.html(message);
            },
            init: function () {
                if (s.params.nextButton) {
                    var nextButton = $(s.params.nextButton);
                    s.a11y.makeFocusable(nextButton);
                    s.a11y.addRole(nextButton, 'button');
                    s.a11y.addLabel(nextButton, s.params.nextSlideMsg);
                }
                if (s.params.prevButton) {
                    var prevButton = $(s.params.prevButton);
                    s.a11y.makeFocusable(prevButton);
                    s.a11y.addRole(prevButton, 'button');
                    s.a11y.addLabel(prevButton, s.params.prevSlideMsg);
                }
                $(s.container).append(s.a11y.liveRegion);
            },
            destroy: function () {
                if (s.a11y.liveRegion && s.a11y.liveRegion.length > 0)
                    s.a11y.liveRegion.remove();
            }
        };
        s.init = function () {
            if (s.params.loop)
                s.createLoop();
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                if (!s.params.loop)
                    s.updateProgress();
                s.effects[s.params.effect].setTranslate();
            }
            if (s.params.loop) {
                s.slideTo(s.params.initialSlide + s.loopedSlides, 0, s.params.runCallbacksOnInit);
            } else {
                s.slideTo(s.params.initialSlide, 0, s.params.runCallbacksOnInit);
                if (s.params.initialSlide === 0) {
                    if (s.parallax && s.params.parallax)
                        s.parallax.setTranslate();
                    if (s.lazy && s.params.lazyLoading) {
                        s.lazy.load();
                        s.lazy.initialImageLoaded = true;
                    }
                }
            }
            s.attachEvents();
            if (s.params.observer && s.support.observer) {
                s.initObservers();
            }
            if (s.params.preloadImages && !s.params.lazyLoading) {
                s.preloadImages();
            }
            if (s.params.autoplay) {
                s.startAutoplay();
            }
            if (s.params.keyboardControl) {
                if (s.enableKeyboardControl)
                    s.enableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.enableMousewheelControl)
                    s.enableMousewheelControl();
            }
            if (s.params.hashnav) {
                if (s.hashnav)
                    s.hashnav.init();
            }
            if (s.params.a11y && s.a11y)
                s.a11y.init();
            s.emit('onInit', s);
        };
        s.cleanupStyles = function () {
            s.container.removeClass(s.classNames.join(' ')).removeAttr('style');
            s.wrapper.removeAttr('style');
            if (s.slides && s.slides.length) {
                s.slides.removeClass([
                    s.params.slideVisibleClass,
                    s.params.slideActiveClass,
                    s.params.slideNextClass,
                    s.params.slidePrevClass
                ].join(' ')).removeAttr('style').removeAttr('data-swiper-column').removeAttr('data-swiper-row');
            }
            if (s.paginationContainer && s.paginationContainer.length) {
                s.paginationContainer.removeClass(s.params.paginationHiddenClass);
            }
            if (s.bullets && s.bullets.length) {
                s.bullets.removeClass(s.params.bulletActiveClass);
            }
            if (s.params.prevButton)
                $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
            if (s.params.nextButton)
                $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);
            if (s.params.scrollbar && s.scrollbar) {
                if (s.scrollbar.track && s.scrollbar.track.length)
                    s.scrollbar.track.removeAttr('style');
                if (s.scrollbar.drag && s.scrollbar.drag.length)
                    s.scrollbar.drag.removeAttr('style');
            }
        };
        s.destroy = function (deleteInstance, cleanupStyles) {
            s.detachEvents();
            s.stopAutoplay();
            if (s.params.loop) {
                s.destroyLoop();
            }
            if (cleanupStyles) {
                s.cleanupStyles();
            }
            s.disconnectObservers();
            if (s.params.keyboardControl) {
                if (s.disableKeyboardControl)
                    s.disableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.disableMousewheelControl)
                    s.disableMousewheelControl();
            }
            if (s.params.a11y && s.a11y)
                s.a11y.destroy();
            s.emit('onDestroy');
            if (deleteInstance !== false)
                s = null;
        };
        s.init();
        return s;
    };
    Swiper.prototype = {
        isSafari: function () {
            var ua = navigator.userAgent.toLowerCase();
            return ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0;
        }(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),
        isArray: function (arr) {
            return Object.prototype.toString.apply(arr) === '[object Array]';
        },
        browser: {
            ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
            ieTouch: window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 1 || window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 1
        },
        device: function () {
            var ua = navigator.userAgent;
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
            return {
                ios: ipad || iphone || ipad,
                android: android
            };
        }(),
        support: {
            touch: window.Modernizr && Modernizr.touch === true || function () {
                return !!('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);
            }(),
            transforms3d: window.Modernizr && Modernizr.csstransforms3d === true || function () {
                var div = document.createElement('div').style;
                return 'webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div;
            }(),
            flexbox: function () {
                var div = document.createElement('div').style;
                var styles = 'alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient'.split(' ');
                for (var i = 0; i < styles.length; i++) {
                    if (styles[i] in div)
                        return true;
                }
            }(),
            observer: function () {
                return 'MutationObserver' in window || 'WebkitMutationObserver' in window;
            }()
        },
        plugins: {}
    };
    var Dom7 = function () {
        var Dom7 = function (arr) {
            var _this = this, i = 0;
            for (i = 0; i < arr.length; i++) {
                _this[i] = arr[i];
            }
            _this.length = arr.length;
            return this;
        };
        var $ = function (selector, context) {
            var arr = [], i = 0;
            if (selector && !context) {
                if (selector instanceof Dom7) {
                    return selector;
                }
            }
            if (selector) {
                if (typeof selector === 'string') {
                    var els, tempParent, html = selector.trim();
                    if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
                        var toCreate = 'div';
                        if (html.indexOf('<li') === 0)
                            toCreate = 'ul';
                        if (html.indexOf('<tr') === 0)
                            toCreate = 'tbody';
                        if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0)
                            toCreate = 'tr';
                        if (html.indexOf('<tbody') === 0)
                            toCreate = 'table';
                        if (html.indexOf('<option') === 0)
                            toCreate = 'select';
                        tempParent = document.createElement(toCreate);
                        tempParent.innerHTML = selector;
                        for (i = 0; i < tempParent.childNodes.length; i++) {
                            arr.push(tempParent.childNodes[i]);
                        }
                    } else {
                        if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
                            els = [document.getElementById(selector.split('#')[1])];
                        } else {
                            els = (context || document).querySelectorAll(selector);
                        }
                        for (i = 0; i < els.length; i++) {
                            if (els[i])
                                arr.push(els[i]);
                        }
                    }
                } else if (selector.nodeType || selector === window || selector === document) {
                    arr.push(selector);
                } else if (selector.length > 0 && selector[0].nodeType) {
                    for (i = 0; i < selector.length; i++) {
                        arr.push(selector[i]);
                    }
                }
            }
            return new Dom7(arr);
        };
        Dom7.prototype = {
            addClass: function (className) {
                if (typeof className === 'undefined') {
                    return this;
                }
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.add(classes[i]);
                    }
                }
                return this;
            },
            removeClass: function (className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.remove(classes[i]);
                    }
                }
                return this;
            },
            hasClass: function (className) {
                if (!this[0])
                    return false;
                else
                    return this[0].classList.contains(className);
            },
            toggleClass: function (className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.toggle(classes[i]);
                    }
                }
                return this;
            },
            attr: function (attrs, value) {
                if (arguments.length === 1 && typeof attrs === 'string') {
                    if (this[0])
                        return this[0].getAttribute(attrs);
                    else
                        return undefined;
                } else {
                    for (var i = 0; i < this.length; i++) {
                        if (arguments.length === 2) {
                            this[i].setAttribute(attrs, value);
                        } else {
                            for (var attrName in attrs) {
                                this[i][attrName] = attrs[attrName];
                                this[i].setAttribute(attrName, attrs[attrName]);
                            }
                        }
                    }
                    return this;
                }
            },
            removeAttr: function (attr) {
                for (var i = 0; i < this.length; i++) {
                    this[i].removeAttribute(attr);
                }
                return this;
            },
            data: function (key, value) {
                if (typeof value === 'undefined') {
                    if (this[0]) {
                        var dataKey = this[0].getAttribute('data-' + key);
                        if (dataKey)
                            return dataKey;
                        else if (this[0].dom7ElementDataStorage && key in this[0].dom7ElementDataStorage)
                            return this[0].dom7ElementDataStorage[key];
                        else
                            return undefined;
                    } else
                        return undefined;
                } else {
                    for (var i = 0; i < this.length; i++) {
                        var el = this[i];
                        if (!el.dom7ElementDataStorage)
                            el.dom7ElementDataStorage = {};
                        el.dom7ElementDataStorage[key] = value;
                    }
                    return this;
                }
            },
            transform: function (transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            },
            transition: function (duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            },
            on: function (eventName, targetSelector, listener, capture) {
                function handleLiveEvent(e) {
                    var target = e.target;
                    if ($(target).is(targetSelector))
                        listener.call(target, e);
                    else {
                        var parents = $(target).parents();
                        for (var k = 0; k < parents.length; k++) {
                            if ($(parents[k]).is(targetSelector))
                                listener.call(parents[k], e);
                        }
                    }
                }
                var events = eventName.split(' ');
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof targetSelector === 'function' || targetSelector === false) {
                        if (typeof targetSelector === 'function') {
                            listener = arguments[1];
                            capture = arguments[2] || false;
                        }
                        for (j = 0; j < events.length; j++) {
                            this[i].addEventListener(events[j], listener, capture);
                        }
                    } else {
                        for (j = 0; j < events.length; j++) {
                            if (!this[i].dom7LiveListeners)
                                this[i].dom7LiveListeners = [];
                            this[i].dom7LiveListeners.push({
                                listener: listener,
                                liveListener: handleLiveEvent
                            });
                            this[i].addEventListener(events[j], handleLiveEvent, capture);
                        }
                    }
                }
                return this;
            },
            off: function (eventName, targetSelector, listener, capture) {
                var events = eventName.split(' ');
                for (var i = 0; i < events.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        if (typeof targetSelector === 'function' || targetSelector === false) {
                            if (typeof targetSelector === 'function') {
                                listener = arguments[1];
                                capture = arguments[2] || false;
                            }
                            this[j].removeEventListener(events[i], listener, capture);
                        } else {
                            if (this[j].dom7LiveListeners) {
                                for (var k = 0; k < this[j].dom7LiveListeners.length; k++) {
                                    if (this[j].dom7LiveListeners[k].listener === listener) {
                                        this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].liveListener, capture);
                                    }
                                }
                            }
                        }
                    }
                }
                return this;
            },
            once: function (eventName, targetSelector, listener, capture) {
                var dom = this;
                if (typeof targetSelector === 'function') {
                    targetSelector = false;
                    listener = arguments[1];
                    capture = arguments[2];
                }
                function proxy(e) {
                    listener(e);
                    dom.off(eventName, targetSelector, proxy, capture);
                }
                dom.on(eventName, targetSelector, proxy, capture);
            },
            trigger: function (eventName, eventData) {
                for (var i = 0; i < this.length; i++) {
                    var evt;
                    try {
                        evt = new window.CustomEvent(eventName, {
                            detail: eventData,
                            bubbles: true,
                            cancelable: true
                        });
                    } catch (e) {
                        evt = document.createEvent('Event');
                        evt.initEvent(eventName, true, true);
                        evt.detail = eventData;
                    }
                    this[i].dispatchEvent(evt);
                }
                return this;
            },
            transitionEnd: function (callback) {
                var events = [
                        'webkitTransitionEnd',
                        'transitionend',
                        'oTransitionEnd',
                        'MSTransitionEnd',
                        'msTransitionEnd'
                    ], i, j, dom = this;
                function fireCallBack(e) {
                    if (e.target !== this)
                        return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            },
            width: function () {
                if (this[0] === window) {
                    return window.innerWidth;
                } else {
                    if (this.length > 0) {
                        return parseFloat(this.css('width'));
                    } else {
                        return null;
                    }
                }
            },
            outerWidth: function (includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return this[0].offsetWidth + parseFloat(this.css('margin-right')) + parseFloat(this.css('margin-left'));
                    else
                        return this[0].offsetWidth;
                } else
                    return null;
            },
            height: function () {
                if (this[0] === window) {
                    return window.innerHeight;
                } else {
                    if (this.length > 0) {
                        return parseFloat(this.css('height'));
                    } else {
                        return null;
                    }
                }
            },
            outerHeight: function (includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return this[0].offsetHeight + parseFloat(this.css('margin-top')) + parseFloat(this.css('margin-bottom'));
                    else
                        return this[0].offsetHeight;
                } else
                    return null;
            },
            offset: function () {
                if (this.length > 0) {
                    var el = this[0];
                    var box = el.getBoundingClientRect();
                    var body = document.body;
                    var clientTop = el.clientTop || body.clientTop || 0;
                    var clientLeft = el.clientLeft || body.clientLeft || 0;
                    var scrollTop = window.pageYOffset || el.scrollTop;
                    var scrollLeft = window.pageXOffset || el.scrollLeft;
                    return {
                        top: box.top + scrollTop - clientTop,
                        left: box.left + scrollLeft - clientLeft
                    };
                } else {
                    return null;
                }
            },
            css: function (props, value) {
                var i;
                if (arguments.length === 1) {
                    if (typeof props === 'string') {
                        if (this[0])
                            return window.getComputedStyle(this[0], null).getPropertyValue(props);
                    } else {
                        for (i = 0; i < this.length; i++) {
                            for (var prop in props) {
                                this[i].style[prop] = props[prop];
                            }
                        }
                        return this;
                    }
                }
                if (arguments.length === 2 && typeof props === 'string') {
                    for (i = 0; i < this.length; i++) {
                        this[i].style[props] = value;
                    }
                    return this;
                }
                return this;
            },
            each: function (callback) {
                for (var i = 0; i < this.length; i++) {
                    callback.call(this[i], i, this[i]);
                }
                return this;
            },
            html: function (html) {
                if (typeof html === 'undefined') {
                    return this[0] ? this[0].innerHTML : undefined;
                } else {
                    for (var i = 0; i < this.length; i++) {
                        this[i].innerHTML = html;
                    }
                    return this;
                }
            },
            is: function (selector) {
                if (!this[0])
                    return false;
                var compareWith, i;
                if (typeof selector === 'string') {
                    var el = this[0];
                    if (el === document)
                        return selector === document;
                    if (el === window)
                        return selector === window;
                    if (el.matches)
                        return el.matches(selector);
                    else if (el.webkitMatchesSelector)
                        return el.webkitMatchesSelector(selector);
                    else if (el.mozMatchesSelector)
                        return el.mozMatchesSelector(selector);
                    else if (el.msMatchesSelector)
                        return el.msMatchesSelector(selector);
                    else {
                        compareWith = $(selector);
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0])
                                return true;
                        }
                        return false;
                    }
                } else if (selector === document)
                    return this[0] === document;
                else if (selector === window)
                    return this[0] === window;
                else {
                    if (selector.nodeType || selector instanceof Dom7) {
                        compareWith = selector.nodeType ? [selector] : selector;
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0])
                                return true;
                        }
                        return false;
                    }
                    return false;
                }
            },
            index: function () {
                if (this[0]) {
                    var child = this[0];
                    var i = 0;
                    while ((child = child.previousSibling) !== null) {
                        if (child.nodeType === 1)
                            i++;
                    }
                    return i;
                } else
                    return undefined;
            },
            eq: function (index) {
                if (typeof index === 'undefined')
                    return this;
                var length = this.length;
                var returnIndex;
                if (index > length - 1) {
                    return new Dom7([]);
                }
                if (index < 0) {
                    returnIndex = length + index;
                    if (returnIndex < 0)
                        return new Dom7([]);
                    else
                        return new Dom7([this[returnIndex]]);
                }
                return new Dom7([this[index]]);
            },
            append: function (newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        while (tempDiv.firstChild) {
                            this[i].appendChild(tempDiv.firstChild);
                        }
                    } else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].appendChild(newChild[j]);
                        }
                    } else {
                        this[i].appendChild(newChild);
                    }
                }
                return this;
            },
            prepend: function (newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        for (j = tempDiv.childNodes.length - 1; j >= 0; j--) {
                            this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
                        }
                    } else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].insertBefore(newChild[j], this[i].childNodes[0]);
                        }
                    } else {
                        this[i].insertBefore(newChild, this[i].childNodes[0]);
                    }
                }
                return this;
            },
            insertBefore: function (selector) {
                var before = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (before.length === 1) {
                        before[0].parentNode.insertBefore(this[i], before[0]);
                    } else if (before.length > 1) {
                        for (var j = 0; j < before.length; j++) {
                            before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
                        }
                    }
                }
            },
            insertAfter: function (selector) {
                var after = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (after.length === 1) {
                        after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
                    } else if (after.length > 1) {
                        for (var j = 0; j < after.length; j++) {
                            after[j].parentNode.insertBefore(this[i].cloneNode(true), after[j].nextSibling);
                        }
                    }
                }
            },
            next: function (selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector))
                            return new Dom7([this[0].nextElementSibling]);
                        else
                            return new Dom7([]);
                    } else {
                        if (this[0].nextElementSibling)
                            return new Dom7([this[0].nextElementSibling]);
                        else
                            return new Dom7([]);
                    }
                } else
                    return new Dom7([]);
            },
            nextAll: function (selector) {
                var nextEls = [];
                var el = this[0];
                if (!el)
                    return new Dom7([]);
                while (el.nextElementSibling) {
                    var next = el.nextElementSibling;
                    if (selector) {
                        if ($(next).is(selector))
                            nextEls.push(next);
                    } else
                        nextEls.push(next);
                    el = next;
                }
                return new Dom7(nextEls);
            },
            prev: function (selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].previousElementSibling && $(this[0].previousElementSibling).is(selector))
                            return new Dom7([this[0].previousElementSibling]);
                        else
                            return new Dom7([]);
                    } else {
                        if (this[0].previousElementSibling)
                            return new Dom7([this[0].previousElementSibling]);
                        else
                            return new Dom7([]);
                    }
                } else
                    return new Dom7([]);
            },
            prevAll: function (selector) {
                var prevEls = [];
                var el = this[0];
                if (!el)
                    return new Dom7([]);
                while (el.previousElementSibling) {
                    var prev = el.previousElementSibling;
                    if (selector) {
                        if ($(prev).is(selector))
                            prevEls.push(prev);
                    } else
                        prevEls.push(prev);
                    el = prev;
                }
                return new Dom7(prevEls);
            },
            parent: function (selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    if (selector) {
                        if ($(this[i].parentNode).is(selector))
                            parents.push(this[i].parentNode);
                    } else {
                        parents.push(this[i].parentNode);
                    }
                }
                return $($.unique(parents));
            },
            parents: function (selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    var parent = this[i].parentNode;
                    while (parent) {
                        if (selector) {
                            if ($(parent).is(selector))
                                parents.push(parent);
                        } else {
                            parents.push(parent);
                        }
                        parent = parent.parentNode;
                    }
                }
                return $($.unique(parents));
            },
            find: function (selector) {
                var foundElements = [];
                for (var i = 0; i < this.length; i++) {
                    var found = this[i].querySelectorAll(selector);
                    for (var j = 0; j < found.length; j++) {
                        foundElements.push(found[j]);
                    }
                }
                return new Dom7(foundElements);
            },
            children: function (selector) {
                var children = [];
                for (var i = 0; i < this.length; i++) {
                    var childNodes = this[i].childNodes;
                    for (var j = 0; j < childNodes.length; j++) {
                        if (!selector) {
                            if (childNodes[j].nodeType === 1)
                                children.push(childNodes[j]);
                        } else {
                            if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector))
                                children.push(childNodes[j]);
                        }
                    }
                }
                return new Dom7($.unique(children));
            },
            remove: function () {
                for (var i = 0; i < this.length; i++) {
                    if (this[i].parentNode)
                        this[i].parentNode.removeChild(this[i]);
                }
                return this;
            },
            add: function () {
                var dom = this;
                var i, j;
                for (i = 0; i < arguments.length; i++) {
                    var toAdd = $(arguments[i]);
                    for (j = 0; j < toAdd.length; j++) {
                        dom[dom.length] = toAdd[j];
                        dom.length++;
                    }
                }
                return dom;
            }
        };
        $.fn = Dom7.prototype;
        $.unique = function (arr) {
            var unique = [];
            for (var i = 0; i < arr.length; i++) {
                if (unique.indexOf(arr[i]) === -1)
                    unique.push(arr[i]);
            }
            return unique;
        };
        return $;
    }();
    var swiperDomPlugins = [
        'jQuery',
        'Zepto',
        'Dom7'
    ];
    function addLibraryPlugin(lib) {
        lib.fn.swiper = function (params) {
            var firstInstance;
            lib(this).each(function () {
                var s = new Swiper(this, params);
                if (!firstInstance)
                    firstInstance = s;
            });
            return firstInstance;
        };
    }
    for (var i = 0; i < swiperDomPlugins.length; i++) {
        if (window[swiperDomPlugins[i]]) {
            addLibraryPlugin(window[swiperDomPlugins[i]]);
        }
    }
    var domLib;
    if (typeof Dom7 === 'undefined') {
        domLib = window.Dom7 || window.Zepto || window.jQuery;
    } else {
        domLib = Dom7;
    }
    if (domLib) {
        if (!('transitionEnd' in domLib.fn)) {
            domLib.fn.transitionEnd = function (callback) {
                var events = [
                        'webkitTransitionEnd',
                        'transitionend',
                        'oTransitionEnd',
                        'MSTransitionEnd',
                        'msTransitionEnd'
                    ], i, j, dom = this;
                function fireCallBack(e) {
                    if (e.target !== this)
                        return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            };
        }
        if (!('transform' in domLib.fn)) {
            domLib.fn.transform = function (transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            };
        }
        if (!('transition' in domLib.fn)) {
            domLib.fn.transition = function (duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            };
        }
    }
    window.Swiper = Swiper;
}());
if (typeof module !== 'undefined') {
    module.exports = window.Swiper;
} else if (typeof define === 'function' && define.amd) {
    define('swiper', [], function () {
        'use strict';
        return window.Swiper;
    });
}
define('views/app', [
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'swiper'
], function ($, _, Backbone, JST, Swiper) {
    'use strict';
    var AppView = Backbone.View.extend({
        el: $(window),
        events: {
            'load': 'onload',
            'scroll': 'scrollHandler',
            'resize': 'resizeHandler'
        },
        initialize: function () {
            this.mobileCheck();
            var $header = this.$header = $('#header');
            var $footer = this.$footer = $('#footer');
            this.CONST = { 'headerHeight': 50 };
            this.updateCONST();
            $(document).ready(function () {
                var mySwiper = new Swiper('.swiper-container', {});
            });
        },
        render: function () {
        },
        mobileCheck: function () {
            var check = this.isMobile = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
                    check = true;
            }(navigator.userAgent || navigator.vendor || window.opera));
            return check;
        },
        scrollHandler: function () {
            var $header = this.$header;
            var $el = this.$el;
            if (!this.isMobile) {
                if ($el.scrollTop() > this.CONST.paperTop) {
                    $header.removeClass('navbar-default').addClass('navbar-inverse');
                } else {
                    $header.removeClass('navbar-inverse').addClass('navbar-default');
                }
            } else if ($header.hasClass('.navbar-inverse')) {
                $header.removeClass('navbar-inverse').addClass('navbar-default');
            }
        },
        updateCONST: function () {
            var CONST = this.CONST;
            CONST.paperTop = $('#paper').offset().top - CONST.headerHeight;
        }
    });
    return AppView;
});
(function (factory) {
    var root = typeof self == 'object' && self.self == self && self;
    if (typeof define === 'function' && define.amd) {
        define('instatag', ['jquery'], function ($) {
            return factory(root, $);
        });
    } else {
        root.Instatag = factory(root, $);
    }
}(function (root, $) {
    var Instatag = function (opts) {
        var defaults = {
            success: function () {
            },
            sort: 'recent'
        };
        if (!opts || !(opts.accessToken || opts.clientId))
            throw new Error('No accessToken or ClientId');
        for (var def in defaults) {
            if (typeof opts[def] === 'undefined') {
                opts[def] = defaults[def];
            } else if (typeof opts[def] === 'object') {
                for (var deepDef in opts[def]) {
                    if (typeof opts[def][deepDef] === 'undefined') {
                        opts[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }
        var self = this;
        self.opts = opts;
        self.requests = [];
        self.data = [];
    };
    function _buildUrl(tagName) {
        return 'https://api.instagram.com/v1/tags/' + encodeURIComponent(tagName) + '/media/recent';
    }
    ;
    Instatag.prototype.send = function () {
        var self = this;
        $.each(self.opts.tags, function (idx, tag) {
            var instaParams = {};
            var url = _buildUrl(tag);
            if (self.opts.accessToken)
                instaParams['access_token'] = self.opts.accessToken;
            if (self.opts.clientId)
                instaParams['client_id'] = self.opts.clientId;
            self.requests[self.requests.length] = $.ajax({
                dataType: 'jsonp',
                url: url,
                data: instaParams,
                success: function (response) {
                    console.log('Ajax response', response);
                    self.data = $.merge(self.data, response.data);
                }
            });
        });
        $.when.apply($, self.requests).done(function () {
            self.data = self.data.sortWithUniq(cmp.recent);
            self.opts.success(self.data);
            console.log('all done', self.data);
        });
    };
    Array.prototype.sortWithUniq = function (cmp, uniqKey) {
        var sorted = this.sort(cmp);
        return $.map(sorted, function (val, idx) {
            if (idx !== 0 && sorted[idx - 1]['id'] !== val['id'])
                return val;
        });
    };
    var cmp = {
        recent: function (f, b) {
            var key = 'created_time';
            return b[key] - f[key];
        }
    };
    return Instatag;
}));
define('models/instaItem', [
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';
    var InstaItemModel = Backbone.Model.extend({
        url: '',
        initialize: function () {
        },
        defaults: {}
    });
    return InstaItemModel;
});
define('collections/instaItem', [
    'underscore',
    'backbone',
    'models/instaItem'
], function (_, Backbone, InstaItemModel) {
    'use strict';
    var InstaItemCollection = Backbone.Collection.extend({ model: InstaItemModel });
    return InstaItemCollection;
});
(function (window) {
    'use strict';
    var docElem = document.documentElement;
    var bind = function () {
    };
    function getIEEvent(obj) {
        var event = window.event;
        event.target = event.target || event.srcElement || obj;
        return event;
    }
    if (docElem.addEventListener) {
        bind = function (obj, type, fn) {
            obj.addEventListener(type, fn, false);
        };
    } else if (docElem.attachEvent) {
        bind = function (obj, type, fn) {
            obj[type + fn] = fn.handleEvent ? function () {
                var event = getIEEvent(obj);
                fn.handleEvent.call(fn, event);
            } : function () {
                var event = getIEEvent(obj);
                fn.call(obj, event);
            };
            obj.attachEvent('on' + type, obj[type + fn]);
        };
    }
    var unbind = function () {
    };
    if (docElem.removeEventListener) {
        unbind = function (obj, type, fn) {
            obj.removeEventListener(type, fn, false);
        };
    } else if (docElem.detachEvent) {
        unbind = function (obj, type, fn) {
            obj.detachEvent('on' + type, obj[type + fn]);
            try {
                delete obj[type + fn];
            } catch (err) {
                obj[type + fn] = undefined;
            }
        };
    }
    var eventie = {
        bind: bind,
        unbind: unbind
    };
    if (typeof define === 'function' && define.amd) {
        define('app/bower_components/eventie/eventie', [], eventie);
    } else if (typeof exports === 'object') {
        module.exports = eventie;
    } else {
        window.eventie = eventie;
    }
}(window));
;
(function () {
    'use strict';
    function EventEmitter() {
    }
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }
        return -1;
    }
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        } else {
            response = events[evt] || (events[evt] = []);
        }
        return response;
    };
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;
        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }
        return flatListeners;
    };
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;
        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }
        return response || listeners;
    };
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;
        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }
        return this;
    };
    proto.on = alias('addListener');
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };
    proto.once = alias('addOnceListener');
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;
        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);
                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }
        return this;
    };
    proto.off = alias('removeListener');
    proto.addListeners = function addListeners(evt, listeners) {
        return this.manipulateListeners(false, evt, listeners);
    };
    proto.removeListeners = function removeListeners(evt, listeners) {
        return this.manipulateListeners(true, evt, listeners);
    };
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    } else {
                        multiple.call(this, i, value);
                    }
                }
            }
        } else {
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }
        return this;
    };
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;
        if (type === 'string') {
            delete events[evt];
        } else if (evt instanceof RegExp) {
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        } else {
            delete this._events;
        }
        return this;
    };
    proto.removeAllListeners = alias('removeEvent');
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;
        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;
                while (i--) {
                    listener = listeners[key][i];
                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }
                    response = listener.listener.apply(this, args || []);
                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }
        return this;
    };
    proto.trigger = alias('emitEvent');
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        } else {
            return true;
        }
    };
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };
    if (typeof define === 'function' && define.amd) {
        define('app/bower_components/eventEmitter/EventEmitter', [], function () {
            return EventEmitter;
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = EventEmitter;
    } else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));
(function (window) {
    'use strict';
    var prefixes = 'Webkit Moz ms Ms O'.split(' ');
    var docElemStyle = document.documentElement.style;
    function getStyleProperty(propName) {
        if (!propName) {
            return;
        }
        if (typeof docElemStyle[propName] === 'string') {
            return propName;
        }
        propName = propName.charAt(0).toUpperCase() + propName.slice(1);
        var prefixed;
        for (var i = 0, len = prefixes.length; i < len; i++) {
            prefixed = prefixes[i] + propName;
            if (typeof docElemStyle[prefixed] === 'string') {
                return prefixed;
            }
        }
    }
    if (typeof define === 'function' && define.amd) {
        define('app/bower_components/get-style-property/get-style-property', [], function () {
            return getStyleProperty;
        });
    } else if (typeof exports === 'object') {
        module.exports = getStyleProperty;
    } else {
        window.getStyleProperty = getStyleProperty;
    }
}(window));
(function (window, undefined) {
    'use strict';
    function getStyleSize(value) {
        var num = parseFloat(value);
        var isValid = value.indexOf('%') === -1 && !isNaN(num);
        return isValid && num;
    }
    function noop() {
    }
    var logError = typeof console === 'undefined' ? noop : function (message) {
        console.error(message);
    };
    var measurements = [
        'paddingLeft',
        'paddingRight',
        'paddingTop',
        'paddingBottom',
        'marginLeft',
        'marginRight',
        'marginTop',
        'marginBottom',
        'borderLeftWidth',
        'borderRightWidth',
        'borderTopWidth',
        'borderBottomWidth'
    ];
    function getZeroSize() {
        var size = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0
        };
        for (var i = 0, len = measurements.length; i < len; i++) {
            var measurement = measurements[i];
            size[measurement] = 0;
        }
        return size;
    }
    function defineGetSize(getStyleProperty) {
        var isSetup = false;
        var getStyle, boxSizingProp, isBoxSizeOuter;
        function setup() {
            if (isSetup) {
                return;
            }
            isSetup = true;
            var getComputedStyle = window.getComputedStyle;
            getStyle = function () {
                var getStyleFn = getComputedStyle ? function (elem) {
                    return getComputedStyle(elem, null);
                } : function (elem) {
                    return elem.currentStyle;
                };
                return function getStyle(elem) {
                    var style = getStyleFn(elem);
                    if (!style) {
                        logError('Style returned ' + style + '. Are you running this code in a hidden iframe on Firefox? ' + 'See http://bit.ly/getsizebug1');
                    }
                    return style;
                };
            }();
            boxSizingProp = getStyleProperty('boxSizing');
            if (boxSizingProp) {
                var div = document.createElement('div');
                div.style.width = '200px';
                div.style.padding = '1px 2px 3px 4px';
                div.style.borderStyle = 'solid';
                div.style.borderWidth = '1px 2px 3px 4px';
                div.style[boxSizingProp] = 'border-box';
                var body = document.body || document.documentElement;
                body.appendChild(div);
                var style = getStyle(div);
                isBoxSizeOuter = getStyleSize(style.width) === 200;
                body.removeChild(div);
            }
        }
        function getSize(elem) {
            setup();
            if (typeof elem === 'string') {
                elem = document.querySelector(elem);
            }
            if (!elem || typeof elem !== 'object' || !elem.nodeType) {
                return;
            }
            var style = getStyle(elem);
            if (style.display === 'none') {
                return getZeroSize();
            }
            var size = {};
            size.width = elem.offsetWidth;
            size.height = elem.offsetHeight;
            var isBorderBox = size.isBorderBox = !!(boxSizingProp && style[boxSizingProp] && style[boxSizingProp] === 'border-box');
            for (var i = 0, len = measurements.length; i < len; i++) {
                var measurement = measurements[i];
                var value = style[measurement];
                value = mungeNonPixel(elem, value);
                var num = parseFloat(value);
                size[measurement] = !isNaN(num) ? num : 0;
            }
            var paddingWidth = size.paddingLeft + size.paddingRight;
            var paddingHeight = size.paddingTop + size.paddingBottom;
            var marginWidth = size.marginLeft + size.marginRight;
            var marginHeight = size.marginTop + size.marginBottom;
            var borderWidth = size.borderLeftWidth + size.borderRightWidth;
            var borderHeight = size.borderTopWidth + size.borderBottomWidth;
            var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;
            var styleWidth = getStyleSize(style.width);
            if (styleWidth !== false) {
                size.width = styleWidth + (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
            }
            var styleHeight = getStyleSize(style.height);
            if (styleHeight !== false) {
                size.height = styleHeight + (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
            }
            size.innerWidth = size.width - (paddingWidth + borderWidth);
            size.innerHeight = size.height - (paddingHeight + borderHeight);
            size.outerWidth = size.width + marginWidth;
            size.outerHeight = size.height + marginHeight;
            return size;
        }
        function mungeNonPixel(elem, value) {
            if (window.getComputedStyle || value.indexOf('%') === -1) {
                return value;
            }
            var style = elem.style;
            var left = style.left;
            var rs = elem.runtimeStyle;
            var rsLeft = rs && rs.left;
            if (rsLeft) {
                rs.left = elem.currentStyle.left;
            }
            style.left = value;
            value = style.pixelLeft;
            style.left = left;
            if (rsLeft) {
                rs.left = rsLeft;
            }
            return value;
        }
        return getSize;
    }
    if (typeof define === 'function' && define.amd) {
        define('app/bower_components/get-size/get-size', ['app/bower_components/get-style-property/get-style-property'], defineGetSize);
    } else if (typeof exports === 'object') {
        module.exports = defineGetSize(require('desandro-get-style-property'));
    } else {
        window.getSize = defineGetSize(window.getStyleProperty);
    }
}(window));
(function (window) {
    'use strict';
    var document = window.document;
    var queue = [];
    function docReady(fn) {
        if (typeof fn !== 'function') {
            return;
        }
        if (docReady.isReady) {
            fn();
        } else {
            queue.push(fn);
        }
    }
    docReady.isReady = false;
    function onReady(event) {
        var isIE8NotReady = event.type === 'readystatechange' && document.readyState !== 'complete';
        if (docReady.isReady || isIE8NotReady) {
            return;
        }
        trigger();
    }
    function trigger() {
        docReady.isReady = true;
        for (var i = 0, len = queue.length; i < len; i++) {
            var fn = queue[i];
            fn();
        }
    }
    function defineDocReady(eventie) {
        if (document.readyState === 'complete') {
            trigger();
        } else {
            eventie.bind(document, 'DOMContentLoaded', onReady);
            eventie.bind(document, 'readystatechange', onReady);
            eventie.bind(window, 'load', onReady);
        }
        return docReady;
    }
    if (typeof define === 'function' && define.amd) {
        define('app/bower_components/doc-ready/doc-ready', ['app/bower_components/eventie/eventie'], defineDocReady);
    } else if (typeof exports === 'object') {
        module.exports = defineDocReady(require('eventie'));
    } else {
        window.docReady = defineDocReady(window.eventie);
    }
}(window));
(function (ElemProto) {
    'use strict';
    var matchesMethod = function () {
        if (ElemProto.matches) {
            return 'matches';
        }
        if (ElemProto.matchesSelector) {
            return 'matchesSelector';
        }
        var prefixes = [
            'webkit',
            'moz',
            'ms',
            'o'
        ];
        for (var i = 0, len = prefixes.length; i < len; i++) {
            var prefix = prefixes[i];
            var method = prefix + 'MatchesSelector';
            if (ElemProto[method]) {
                return method;
            }
        }
    }();
    function match(elem, selector) {
        return elem[matchesMethod](selector);
    }
    function checkParent(elem) {
        if (elem.parentNode) {
            return;
        }
        var fragment = document.createDocumentFragment();
        fragment.appendChild(elem);
    }
    function query(elem, selector) {
        checkParent(elem);
        var elems = elem.parentNode.querySelectorAll(selector);
        for (var i = 0, len = elems.length; i < len; i++) {
            if (elems[i] === elem) {
                return true;
            }
        }
        return false;
    }
    function matchChild(elem, selector) {
        checkParent(elem);
        return match(elem, selector);
    }
    var matchesSelector;
    if (matchesMethod) {
        var div = document.createElement('div');
        var supportsOrphans = match(div, 'div');
        matchesSelector = supportsOrphans ? match : matchChild;
    } else {
        matchesSelector = query;
    }
    if (typeof define === 'function' && define.amd) {
        define('app/bower_components/matches-selector/matches-selector', [], function () {
            return matchesSelector;
        });
    } else if (typeof exports === 'object') {
        module.exports = matchesSelector;
    } else {
        window.matchesSelector = matchesSelector;
    }
}(Element.prototype));
(function (window, factory) {
    'use strict';
    if (typeof define == 'function' && define.amd) {
        define('app/bower_components/fizzy-ui-utils/utils', [
            'app/bower_components/doc-ready/doc-ready',
            'app/bower_components/matches-selector/matches-selector'
        ], function (docReady, matchesSelector) {
            return factory(window, docReady, matchesSelector);
        });
    } else if (typeof exports == 'object') {
        module.exports = factory(window, require('doc-ready'), require('desandro-matches-selector'));
    } else {
        window.fizzyUIUtils = factory(window, window.docReady, window.matchesSelector);
    }
}(window, function factory(window, docReady, matchesSelector) {
    'use strict';
    var utils = {};
    utils.extend = function (a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    };
    utils.modulo = function (num, div) {
        return (num % div + div) % div;
    };
    var objToString = Object.prototype.toString;
    utils.isArray = function (obj) {
        return objToString.call(obj) == '[object Array]';
    };
    utils.makeArray = function (obj) {
        var ary = [];
        if (utils.isArray(obj)) {
            ary = obj;
        } else if (obj && typeof obj.length == 'number') {
            for (var i = 0, len = obj.length; i < len; i++) {
                ary.push(obj[i]);
            }
        } else {
            ary.push(obj);
        }
        return ary;
    };
    utils.indexOf = Array.prototype.indexOf ? function (ary, obj) {
        return ary.indexOf(obj);
    } : function (ary, obj) {
        for (var i = 0, len = ary.length; i < len; i++) {
            if (ary[i] === obj) {
                return i;
            }
        }
        return -1;
    };
    utils.removeFrom = function (ary, obj) {
        var index = utils.indexOf(ary, obj);
        if (index != -1) {
            ary.splice(index, 1);
        }
    };
    utils.isElement = typeof HTMLElement == 'function' || typeof HTMLElement == 'object' ? function isElementDOM2(obj) {
        return obj instanceof HTMLElement;
    } : function isElementQuirky(obj) {
        return obj && typeof obj == 'object' && obj.nodeType == 1 && typeof obj.nodeName == 'string';
    };
    utils.setText = function () {
        var setTextProperty;
        function setText(elem, text) {
            setTextProperty = setTextProperty || (document.documentElement.textContent !== undefined ? 'textContent' : 'innerText');
            elem[setTextProperty] = text;
        }
        return setText;
    }();
    utils.getParent = function (elem, selector) {
        while (elem != document.body) {
            elem = elem.parentNode;
            if (matchesSelector(elem, selector)) {
                return elem;
            }
        }
    };
    utils.getQueryElement = function (elem) {
        if (typeof elem == 'string') {
            return document.querySelector(elem);
        }
        return elem;
    };
    utils.handleEvent = function (event) {
        var method = 'on' + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    utils.filterFindElements = function (elems, selector) {
        elems = utils.makeArray(elems);
        var ffElems = [];
        for (var i = 0, len = elems.length; i < len; i++) {
            var elem = elems[i];
            if (!utils.isElement(elem)) {
                continue;
            }
            if (selector) {
                if (matchesSelector(elem, selector)) {
                    ffElems.push(elem);
                }
                var childElems = elem.querySelectorAll(selector);
                for (var j = 0, jLen = childElems.length; j < jLen; j++) {
                    ffElems.push(childElems[j]);
                }
            } else {
                ffElems.push(elem);
            }
        }
        return ffElems;
    };
    utils.debounceMethod = function (_class, methodName, threshold) {
        var method = _class.prototype[methodName];
        var timeoutName = methodName + 'Timeout';
        _class.prototype[methodName] = function () {
            var timeout = this[timeoutName];
            if (timeout) {
                clearTimeout(timeout);
            }
            var args = arguments;
            var _this = this;
            this[timeoutName] = setTimeout(function () {
                method.apply(_this, args);
                delete _this[timeoutName];
            }, threshold || 100);
        };
    };
    utils.toDashed = function (str) {
        return str.replace(/(.)([A-Z])/g, function (match, $1, $2) {
            return $1 + '-' + $2;
        }).toLowerCase();
    };
    var console = window.console;
    utils.htmlInit = function (WidgetClass, namespace) {
        docReady(function () {
            var dashedNamespace = utils.toDashed(namespace);
            var elems = document.querySelectorAll('.js-' + dashedNamespace);
            var dataAttr = 'data-' + dashedNamespace + '-options';
            for (var i = 0, len = elems.length; i < len; i++) {
                var elem = elems[i];
                var attr = elem.getAttribute(dataAttr);
                var options;
                try {
                    options = attr && JSON.parse(attr);
                } catch (error) {
                    if (console) {
                        console.error('Error parsing ' + dataAttr + ' on ' + elem.nodeName.toLowerCase() + (elem.id ? '#' + elem.id : '') + ': ' + error);
                    }
                    continue;
                }
                var instance = new WidgetClass(elem, options);
                var jQuery = window.jQuery;
                if (jQuery) {
                    jQuery.data(elem, namespace, instance);
                }
            }
        });
    };
    return utils;
}));
(function (window, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('app/bower_components/outlayer/item', [
            'app/bower_components/eventEmitter/EventEmitter',
            'app/bower_components/get-size/get-size',
            'app/bower_components/get-style-property/get-style-property',
            'app/bower_components/fizzy-ui-utils/utils'
        ], function (EventEmitter, getSize, getStyleProperty, utils) {
            return factory(window, EventEmitter, getSize, getStyleProperty, utils);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(window, require('wolfy87-eventemitter'), require('get-size'), require('desandro-get-style-property'), require('fizzy-ui-utils'));
    } else {
        window.Outlayer = {};
        window.Outlayer.Item = factory(window, window.EventEmitter, window.getSize, window.getStyleProperty, window.fizzyUIUtils);
    }
}(window, function factory(window, EventEmitter, getSize, getStyleProperty, utils) {
    'use strict';
    var getComputedStyle = window.getComputedStyle;
    var getStyle = getComputedStyle ? function (elem) {
        return getComputedStyle(elem, null);
    } : function (elem) {
        return elem.currentStyle;
    };
    function isEmptyObj(obj) {
        for (var prop in obj) {
            return false;
        }
        prop = null;
        return true;
    }
    var transitionProperty = getStyleProperty('transition');
    var transformProperty = getStyleProperty('transform');
    var supportsCSS3 = transitionProperty && transformProperty;
    var is3d = !!getStyleProperty('perspective');
    var transitionEndEvent = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'otransitionend',
        transition: 'transitionend'
    }[transitionProperty];
    var prefixableProperties = [
        'transform',
        'transition',
        'transitionDuration',
        'transitionProperty'
    ];
    var vendorProperties = function () {
        var cache = {};
        for (var i = 0, len = prefixableProperties.length; i < len; i++) {
            var prop = prefixableProperties[i];
            var supportedProp = getStyleProperty(prop);
            if (supportedProp && supportedProp !== prop) {
                cache[prop] = supportedProp;
            }
        }
        return cache;
    }();
    function Item(element, layout) {
        if (!element) {
            return;
        }
        this.element = element;
        this.layout = layout;
        this.position = {
            x: 0,
            y: 0
        };
        this._create();
    }
    utils.extend(Item.prototype, EventEmitter.prototype);
    Item.prototype._create = function () {
        this._transn = {
            ingProperties: {},
            clean: {},
            onEnd: {}
        };
        this.css({ position: 'absolute' });
    };
    Item.prototype.handleEvent = function (event) {
        var method = 'on' + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    Item.prototype.getSize = function () {
        this.size = getSize(this.element);
    };
    Item.prototype.css = function (style) {
        var elemStyle = this.element.style;
        for (var prop in style) {
            var supportedProp = vendorProperties[prop] || prop;
            elemStyle[supportedProp] = style[prop];
        }
    };
    Item.prototype.getPosition = function () {
        var style = getStyle(this.element);
        var layoutOptions = this.layout.options;
        var isOriginLeft = layoutOptions.isOriginLeft;
        var isOriginTop = layoutOptions.isOriginTop;
        var x = parseInt(style[isOriginLeft ? 'left' : 'right'], 10);
        var y = parseInt(style[isOriginTop ? 'top' : 'bottom'], 10);
        x = isNaN(x) ? 0 : x;
        y = isNaN(y) ? 0 : y;
        var layoutSize = this.layout.size;
        x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
        y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;
        this.position.x = x;
        this.position.y = y;
    };
    Item.prototype.layoutPosition = function () {
        var layoutSize = this.layout.size;
        var layoutOptions = this.layout.options;
        var style = {};
        var xPadding = layoutOptions.isOriginLeft ? 'paddingLeft' : 'paddingRight';
        var xProperty = layoutOptions.isOriginLeft ? 'left' : 'right';
        var xResetProperty = layoutOptions.isOriginLeft ? 'right' : 'left';
        var x = this.position.x + layoutSize[xPadding];
        x = layoutOptions.percentPosition && !layoutOptions.isHorizontal ? x / layoutSize.width * 100 + '%' : x + 'px';
        style[xProperty] = x;
        style[xResetProperty] = '';
        var yPadding = layoutOptions.isOriginTop ? 'paddingTop' : 'paddingBottom';
        var yProperty = layoutOptions.isOriginTop ? 'top' : 'bottom';
        var yResetProperty = layoutOptions.isOriginTop ? 'bottom' : 'top';
        var y = this.position.y + layoutSize[yPadding];
        y = layoutOptions.percentPosition && layoutOptions.isHorizontal ? y / layoutSize.height * 100 + '%' : y + 'px';
        style[yProperty] = y;
        style[yResetProperty] = '';
        this.css(style);
        this.emitEvent('layout', [this]);
    };
    var translate = is3d ? function (x, y) {
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    } : function (x, y) {
        return 'translate(' + x + 'px, ' + y + 'px)';
    };
    Item.prototype._transitionTo = function (x, y) {
        this.getPosition();
        var curX = this.position.x;
        var curY = this.position.y;
        var compareX = parseInt(x, 10);
        var compareY = parseInt(y, 10);
        var didNotMove = compareX === this.position.x && compareY === this.position.y;
        this.setPosition(x, y);
        if (didNotMove && !this.isTransitioning) {
            this.layoutPosition();
            return;
        }
        var transX = x - curX;
        var transY = y - curY;
        var transitionStyle = {};
        var layoutOptions = this.layout.options;
        transX = layoutOptions.isOriginLeft ? transX : -transX;
        transY = layoutOptions.isOriginTop ? transY : -transY;
        transitionStyle.transform = translate(transX, transY);
        this.transition({
            to: transitionStyle,
            onTransitionEnd: { transform: this.layoutPosition },
            isCleaning: true
        });
    };
    Item.prototype.goTo = function (x, y) {
        this.setPosition(x, y);
        this.layoutPosition();
    };
    Item.prototype.moveTo = supportsCSS3 ? Item.prototype._transitionTo : Item.prototype.goTo;
    Item.prototype.setPosition = function (x, y) {
        this.position.x = parseInt(x, 10);
        this.position.y = parseInt(y, 10);
    };
    Item.prototype._nonTransition = function (args) {
        this.css(args.to);
        if (args.isCleaning) {
            this._removeStyles(args.to);
        }
        for (var prop in args.onTransitionEnd) {
            args.onTransitionEnd[prop].call(this);
        }
    };
    Item.prototype._transition = function (args) {
        if (!parseFloat(this.layout.options.transitionDuration)) {
            this._nonTransition(args);
            return;
        }
        var _transition = this._transn;
        for (var prop in args.onTransitionEnd) {
            _transition.onEnd[prop] = args.onTransitionEnd[prop];
        }
        for (prop in args.to) {
            _transition.ingProperties[prop] = true;
            if (args.isCleaning) {
                _transition.clean[prop] = true;
            }
        }
        if (args.from) {
            this.css(args.from);
            var h = this.element.offsetHeight;
            h = null;
        }
        this.enableTransition(args.to);
        this.css(args.to);
        this.isTransitioning = true;
    };
    var itemTransitionProperties = transformProperty && utils.toDashed(transformProperty) + ',opacity';
    Item.prototype.enableTransition = function () {
        if (this.isTransitioning) {
            return;
        }
        this.css({
            transitionProperty: itemTransitionProperties,
            transitionDuration: this.layout.options.transitionDuration
        });
        this.element.addEventListener(transitionEndEvent, this, false);
    };
    Item.prototype.transition = Item.prototype[transitionProperty ? '_transition' : '_nonTransition'];
    Item.prototype.onwebkitTransitionEnd = function (event) {
        this.ontransitionend(event);
    };
    Item.prototype.onotransitionend = function (event) {
        this.ontransitionend(event);
    };
    var dashedVendorProperties = {
        '-webkit-transform': 'transform',
        '-moz-transform': 'transform',
        '-o-transform': 'transform'
    };
    Item.prototype.ontransitionend = function (event) {
        if (event.target !== this.element) {
            return;
        }
        var _transition = this._transn;
        var propertyName = dashedVendorProperties[event.propertyName] || event.propertyName;
        delete _transition.ingProperties[propertyName];
        if (isEmptyObj(_transition.ingProperties)) {
            this.disableTransition();
        }
        if (propertyName in _transition.clean) {
            this.element.style[event.propertyName] = '';
            delete _transition.clean[propertyName];
        }
        if (propertyName in _transition.onEnd) {
            var onTransitionEnd = _transition.onEnd[propertyName];
            onTransitionEnd.call(this);
            delete _transition.onEnd[propertyName];
        }
        this.emitEvent('transitionEnd', [this]);
    };
    Item.prototype.disableTransition = function () {
        this.removeTransitionStyles();
        this.element.removeEventListener(transitionEndEvent, this, false);
        this.isTransitioning = false;
    };
    Item.prototype._removeStyles = function (style) {
        var cleanStyle = {};
        for (var prop in style) {
            cleanStyle[prop] = '';
        }
        this.css(cleanStyle);
    };
    var cleanTransitionStyle = {
        transitionProperty: '',
        transitionDuration: ''
    };
    Item.prototype.removeTransitionStyles = function () {
        this.css(cleanTransitionStyle);
    };
    Item.prototype.removeElem = function () {
        this.element.parentNode.removeChild(this.element);
        this.css({ display: '' });
        this.emitEvent('remove', [this]);
    };
    Item.prototype.remove = function () {
        if (!transitionProperty || !parseFloat(this.layout.options.transitionDuration)) {
            this.removeElem();
            return;
        }
        var _this = this;
        this.once('transitionEnd', function () {
            _this.removeElem();
        });
        this.hide();
    };
    Item.prototype.reveal = function () {
        delete this.isHidden;
        this.css({ display: '' });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
        onTransitionEnd[transitionEndProperty] = this.onRevealTransitionEnd;
        this.transition({
            from: options.hiddenStyle,
            to: options.visibleStyle,
            isCleaning: true,
            onTransitionEnd: onTransitionEnd
        });
    };
    Item.prototype.onRevealTransitionEnd = function () {
        if (!this.isHidden) {
            this.emitEvent('reveal');
        }
    };
    Item.prototype.getHideRevealTransitionEndProperty = function (styleProperty) {
        var optionStyle = this.layout.options[styleProperty];
        if (optionStyle.opacity) {
            return 'opacity';
        }
        for (var prop in optionStyle) {
            return prop;
        }
    };
    Item.prototype.hide = function () {
        this.isHidden = true;
        this.css({ display: '' });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
        onTransitionEnd[transitionEndProperty] = this.onHideTransitionEnd;
        this.transition({
            from: options.visibleStyle,
            to: options.hiddenStyle,
            isCleaning: true,
            onTransitionEnd: onTransitionEnd
        });
    };
    Item.prototype.onHideTransitionEnd = function () {
        if (this.isHidden) {
            this.css({ display: 'none' });
            this.emitEvent('hide');
        }
    };
    Item.prototype.destroy = function () {
        this.css({
            position: '',
            left: '',
            right: '',
            top: '',
            bottom: '',
            transition: '',
            transform: ''
        });
    };
    return Item;
}));
(function (window, factory) {
    'use strict';
    if (typeof define == 'function' && define.amd) {
        define('app/bower_components/outlayer/outlayer', [
            'app/bower_components/eventie/eventie',
            'app/bower_components/eventEmitter/EventEmitter',
            'app/bower_components/get-size/get-size',
            'app/bower_components/fizzy-ui-utils/utils',
            'app/bower_components/outlayer/item'
        ], function (eventie, EventEmitter, getSize, utils, Item) {
            return factory(window, eventie, EventEmitter, getSize, utils, Item);
        });
    } else if (typeof exports == 'object') {
        module.exports = factory(window, require('eventie'), require('wolfy87-eventemitter'), require('get-size'), require('fizzy-ui-utils'), require('./item'));
    } else {
        window.Outlayer = factory(window, window.eventie, window.EventEmitter, window.getSize, window.fizzyUIUtils, window.Outlayer.Item);
    }
}(window, function factory(window, eventie, EventEmitter, getSize, utils, Item) {
    'use strict';
    var console = window.console;
    var jQuery = window.jQuery;
    var noop = function () {
    };
    var GUID = 0;
    var instances = {};
    function Outlayer(element, options) {
        var queryElement = utils.getQueryElement(element);
        if (!queryElement) {
            if (console) {
                console.error('Bad element for ' + this.constructor.namespace + ': ' + (queryElement || element));
            }
            return;
        }
        this.element = queryElement;
        if (jQuery) {
            this.$element = jQuery(this.element);
        }
        this.options = utils.extend({}, this.constructor.defaults);
        this.option(options);
        var id = ++GUID;
        this.element.outlayerGUID = id;
        instances[id] = this;
        this._create();
        if (this.options.isInitLayout) {
            this.layout();
        }
    }
    Outlayer.namespace = 'outlayer';
    Outlayer.Item = Item;
    Outlayer.defaults = {
        containerStyle: { position: 'relative' },
        isInitLayout: true,
        isOriginLeft: true,
        isOriginTop: true,
        isResizeBound: true,
        isResizingContainer: true,
        transitionDuration: '0.4s',
        hiddenStyle: {
            opacity: 0,
            transform: 'scale(0.001)'
        },
        visibleStyle: {
            opacity: 1,
            transform: 'scale(1)'
        }
    };
    utils.extend(Outlayer.prototype, EventEmitter.prototype);
    Outlayer.prototype.option = function (opts) {
        utils.extend(this.options, opts);
    };
    Outlayer.prototype._create = function () {
        this.reloadItems();
        this.stamps = [];
        this.stamp(this.options.stamp);
        utils.extend(this.element.style, this.options.containerStyle);
        if (this.options.isResizeBound) {
            this.bindResize();
        }
    };
    Outlayer.prototype.reloadItems = function () {
        this.items = this._itemize(this.element.children);
    };
    Outlayer.prototype._itemize = function (elems) {
        var itemElems = this._filterFindItemElements(elems);
        var Item = this.constructor.Item;
        var items = [];
        for (var i = 0, len = itemElems.length; i < len; i++) {
            var elem = itemElems[i];
            var item = new Item(elem, this);
            items.push(item);
        }
        return items;
    };
    Outlayer.prototype._filterFindItemElements = function (elems) {
        return utils.filterFindElements(elems, this.options.itemSelector);
    };
    Outlayer.prototype.getItemElements = function () {
        var elems = [];
        for (var i = 0, len = this.items.length; i < len; i++) {
            elems.push(this.items[i].element);
        }
        return elems;
    };
    Outlayer.prototype.layout = function () {
        this._resetLayout();
        this._manageStamps();
        var isInstant = this.options.isLayoutInstant !== undefined ? this.options.isLayoutInstant : !this._isLayoutInited;
        this.layoutItems(this.items, isInstant);
        this._isLayoutInited = true;
    };
    Outlayer.prototype._init = Outlayer.prototype.layout;
    Outlayer.prototype._resetLayout = function () {
        this.getSize();
    };
    Outlayer.prototype.getSize = function () {
        this.size = getSize(this.element);
    };
    Outlayer.prototype._getMeasurement = function (measurement, size) {
        var option = this.options[measurement];
        var elem;
        if (!option) {
            this[measurement] = 0;
        } else {
            if (typeof option === 'string') {
                elem = this.element.querySelector(option);
            } else if (utils.isElement(option)) {
                elem = option;
            }
            this[measurement] = elem ? getSize(elem)[size] : option;
        }
    };
    Outlayer.prototype.layoutItems = function (items, isInstant) {
        items = this._getItemsForLayout(items);
        this._layoutItems(items, isInstant);
        this._postLayout();
    };
    Outlayer.prototype._getItemsForLayout = function (items) {
        var layoutItems = [];
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (!item.isIgnored) {
                layoutItems.push(item);
            }
        }
        return layoutItems;
    };
    Outlayer.prototype._layoutItems = function (items, isInstant) {
        this._emitCompleteOnItems('layout', items);
        if (!items || !items.length) {
            return;
        }
        var queue = [];
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            var position = this._getItemLayoutPosition(item);
            position.item = item;
            position.isInstant = isInstant || item.isLayoutInstant;
            queue.push(position);
        }
        this._processLayoutQueue(queue);
    };
    Outlayer.prototype._getItemLayoutPosition = function () {
        return {
            x: 0,
            y: 0
        };
    };
    Outlayer.prototype._processLayoutQueue = function (queue) {
        for (var i = 0, len = queue.length; i < len; i++) {
            var obj = queue[i];
            this._positionItem(obj.item, obj.x, obj.y, obj.isInstant);
        }
    };
    Outlayer.prototype._positionItem = function (item, x, y, isInstant) {
        if (isInstant) {
            item.goTo(x, y);
        } else {
            item.moveTo(x, y);
        }
    };
    Outlayer.prototype._postLayout = function () {
        this.resizeContainer();
    };
    Outlayer.prototype.resizeContainer = function () {
        if (!this.options.isResizingContainer) {
            return;
        }
        var size = this._getContainerSize();
        if (size) {
            this._setContainerMeasure(size.width, true);
            this._setContainerMeasure(size.height, false);
        }
    };
    Outlayer.prototype._getContainerSize = noop;
    Outlayer.prototype._setContainerMeasure = function (measure, isWidth) {
        if (measure === undefined) {
            return;
        }
        var elemSize = this.size;
        if (elemSize.isBorderBox) {
            measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight + elemSize.borderLeftWidth + elemSize.borderRightWidth : elemSize.paddingBottom + elemSize.paddingTop + elemSize.borderTopWidth + elemSize.borderBottomWidth;
        }
        measure = Math.max(measure, 0);
        this.element.style[isWidth ? 'width' : 'height'] = measure + 'px';
    };
    Outlayer.prototype._emitCompleteOnItems = function (eventName, items) {
        var _this = this;
        function onComplete() {
            _this.emitEvent(eventName + 'Complete', [items]);
        }
        var count = items.length;
        if (!items || !count) {
            onComplete();
            return;
        }
        var doneCount = 0;
        function tick() {
            doneCount++;
            if (doneCount === count) {
                onComplete();
            }
        }
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            item.once(eventName, tick);
        }
    };
    Outlayer.prototype.ignore = function (elem) {
        var item = this.getItem(elem);
        if (item) {
            item.isIgnored = true;
        }
    };
    Outlayer.prototype.unignore = function (elem) {
        var item = this.getItem(elem);
        if (item) {
            delete item.isIgnored;
        }
    };
    Outlayer.prototype.stamp = function (elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }
        this.stamps = this.stamps.concat(elems);
        for (var i = 0, len = elems.length; i < len; i++) {
            var elem = elems[i];
            this.ignore(elem);
        }
    };
    Outlayer.prototype.unstamp = function (elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }
        for (var i = 0, len = elems.length; i < len; i++) {
            var elem = elems[i];
            utils.removeFrom(this.stamps, elem);
            this.unignore(elem);
        }
    };
    Outlayer.prototype._find = function (elems) {
        if (!elems) {
            return;
        }
        if (typeof elems === 'string') {
            elems = this.element.querySelectorAll(elems);
        }
        elems = utils.makeArray(elems);
        return elems;
    };
    Outlayer.prototype._manageStamps = function () {
        if (!this.stamps || !this.stamps.length) {
            return;
        }
        this._getBoundingRect();
        for (var i = 0, len = this.stamps.length; i < len; i++) {
            var stamp = this.stamps[i];
            this._manageStamp(stamp);
        }
    };
    Outlayer.prototype._getBoundingRect = function () {
        var boundingRect = this.element.getBoundingClientRect();
        var size = this.size;
        this._boundingRect = {
            left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
            top: boundingRect.top + size.paddingTop + size.borderTopWidth,
            right: boundingRect.right - (size.paddingRight + size.borderRightWidth),
            bottom: boundingRect.bottom - (size.paddingBottom + size.borderBottomWidth)
        };
    };
    Outlayer.prototype._manageStamp = noop;
    Outlayer.prototype._getElementOffset = function (elem) {
        var boundingRect = elem.getBoundingClientRect();
        var thisRect = this._boundingRect;
        var size = getSize(elem);
        var offset = {
            left: boundingRect.left - thisRect.left - size.marginLeft,
            top: boundingRect.top - thisRect.top - size.marginTop,
            right: thisRect.right - boundingRect.right - size.marginRight,
            bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
        };
        return offset;
    };
    Outlayer.prototype.handleEvent = function (event) {
        var method = 'on' + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    Outlayer.prototype.bindResize = function () {
        if (this.isResizeBound) {
            return;
        }
        eventie.bind(window, 'resize', this);
        this.isResizeBound = true;
    };
    Outlayer.prototype.unbindResize = function () {
        if (this.isResizeBound) {
            eventie.unbind(window, 'resize', this);
        }
        this.isResizeBound = false;
    };
    Outlayer.prototype.onresize = function () {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        var _this = this;
        function delayed() {
            _this.resize();
            delete _this.resizeTimeout;
        }
        this.resizeTimeout = setTimeout(delayed, 100);
    };
    Outlayer.prototype.resize = function () {
        if (!this.isResizeBound || !this.needsResizeLayout()) {
            return;
        }
        this.layout();
    };
    Outlayer.prototype.needsResizeLayout = function () {
        var size = getSize(this.element);
        var hasSizes = this.size && size;
        return hasSizes && size.innerWidth !== this.size.innerWidth;
    };
    Outlayer.prototype.addItems = function (elems) {
        var items = this._itemize(elems);
        if (items.length) {
            this.items = this.items.concat(items);
        }
        return items;
    };
    Outlayer.prototype.appended = function (elems) {
        var items = this.addItems(elems);
        if (!items.length) {
            return;
        }
        this.layoutItems(items, true);
        this.reveal(items);
    };
    Outlayer.prototype.prepended = function (elems) {
        var items = this._itemize(elems);
        if (!items.length) {
            return;
        }
        var previousItems = this.items.slice(0);
        this.items = items.concat(previousItems);
        this._resetLayout();
        this._manageStamps();
        this.layoutItems(items, true);
        this.reveal(items);
        this.layoutItems(previousItems);
    };
    Outlayer.prototype.reveal = function (items) {
        this._emitCompleteOnItems('reveal', items);
        var len = items && items.length;
        for (var i = 0; len && i < len; i++) {
            var item = items[i];
            item.reveal();
        }
    };
    Outlayer.prototype.hide = function (items) {
        this._emitCompleteOnItems('hide', items);
        var len = items && items.length;
        for (var i = 0; len && i < len; i++) {
            var item = items[i];
            item.hide();
        }
    };
    Outlayer.prototype.revealItemElements = function (elems) {
        var items = this.getItems(elems);
        this.reveal(items);
    };
    Outlayer.prototype.hideItemElements = function (elems) {
        var items = this.getItems(elems);
        this.hide(items);
    };
    Outlayer.prototype.getItem = function (elem) {
        for (var i = 0, len = this.items.length; i < len; i++) {
            var item = this.items[i];
            if (item.element === elem) {
                return item;
            }
        }
    };
    Outlayer.prototype.getItems = function (elems) {
        elems = utils.makeArray(elems);
        var items = [];
        for (var i = 0, len = elems.length; i < len; i++) {
            var elem = elems[i];
            var item = this.getItem(elem);
            if (item) {
                items.push(item);
            }
        }
        return items;
    };
    Outlayer.prototype.remove = function (elems) {
        var removeItems = this.getItems(elems);
        this._emitCompleteOnItems('remove', removeItems);
        if (!removeItems || !removeItems.length) {
            return;
        }
        for (var i = 0, len = removeItems.length; i < len; i++) {
            var item = removeItems[i];
            item.remove();
            utils.removeFrom(this.items, item);
        }
    };
    Outlayer.prototype.destroy = function () {
        var style = this.element.style;
        style.height = '';
        style.position = '';
        style.width = '';
        for (var i = 0, len = this.items.length; i < len; i++) {
            var item = this.items[i];
            item.destroy();
        }
        this.unbindResize();
        var id = this.element.outlayerGUID;
        delete instances[id];
        delete this.element.outlayerGUID;
        if (jQuery) {
            jQuery.removeData(this.element, this.constructor.namespace);
        }
    };
    Outlayer.data = function (elem) {
        elem = utils.getQueryElement(elem);
        var id = elem && elem.outlayerGUID;
        return id && instances[id];
    };
    Outlayer.create = function (namespace, options) {
        function Layout() {
            Outlayer.apply(this, arguments);
        }
        if (Object.create) {
            Layout.prototype = Object.create(Outlayer.prototype);
        } else {
            utils.extend(Layout.prototype, Outlayer.prototype);
        }
        Layout.prototype.constructor = Layout;
        Layout.defaults = utils.extend({}, Outlayer.defaults);
        utils.extend(Layout.defaults, options);
        Layout.prototype.settings = {};
        Layout.namespace = namespace;
        Layout.data = Outlayer.data;
        Layout.Item = function LayoutItem() {
            Item.apply(this, arguments);
        };
        Layout.Item.prototype = new Item();
        utils.htmlInit(Layout, namespace);
        if (jQuery && jQuery.bridget) {
            jQuery.bridget(namespace, Layout);
        }
        return Layout;
    };
    Outlayer.Item = Item;
    return Outlayer;
}));
(function (window, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('masonry', [
            'app/bower_components/outlayer/outlayer',
            'app/bower_components/get-size/get-size',
            'app/bower_components/fizzy-ui-utils/utils'
        ], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('outlayer'), require('get-size'), require('fizzy-ui-utils'));
    } else {
        window.Masonry = factory(window.Outlayer, window.getSize, window.fizzyUIUtils);
    }
}(window, function factory(Outlayer, getSize, utils) {
    'use strict';
    var Masonry = Outlayer.create('masonry');
    Masonry.prototype._resetLayout = function () {
        this.getSize();
        this._getMeasurement('columnWidth', 'outerWidth');
        this._getMeasurement('gutter', 'outerWidth');
        this.measureColumns();
        var i = this.cols;
        this.colYs = [];
        while (i--) {
            this.colYs.push(0);
        }
        this.maxY = 0;
    };
    Masonry.prototype.measureColumns = function () {
        this.getContainerWidth();
        if (!this.columnWidth) {
            var firstItem = this.items[0];
            var firstItemElem = firstItem && firstItem.element;
            this.columnWidth = firstItemElem && getSize(firstItemElem).outerWidth || this.containerWidth;
        }
        var columnWidth = this.columnWidth += this.gutter;
        var containerWidth = this.containerWidth + this.gutter;
        var cols = containerWidth / columnWidth;
        var excess = columnWidth - containerWidth % columnWidth;
        var mathMethod = excess && excess < 1 ? 'round' : 'floor';
        cols = Math[mathMethod](cols);
        this.cols = Math.max(cols, 1);
    };
    Masonry.prototype.getContainerWidth = function () {
        var container = this.options.isFitWidth ? this.element.parentNode : this.element;
        var size = getSize(container);
        this.containerWidth = size && size.innerWidth;
    };
    Masonry.prototype._getItemLayoutPosition = function (item) {
        item.getSize();
        var remainder = item.size.outerWidth % this.columnWidth;
        var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
        var colSpan = Math[mathMethod](item.size.outerWidth / this.columnWidth);
        colSpan = Math.min(colSpan, this.cols);
        var colGroup = this._getColGroup(colSpan);
        var minimumY = Math.min.apply(Math, colGroup);
        var shortColIndex = utils.indexOf(colGroup, minimumY);
        var position = {
            x: this.columnWidth * shortColIndex,
            y: minimumY
        };
        var setHeight = minimumY + item.size.outerHeight;
        var setSpan = this.cols + 1 - colGroup.length;
        for (var i = 0; i < setSpan; i++) {
            this.colYs[shortColIndex + i] = setHeight;
        }
        return position;
    };
    Masonry.prototype._getColGroup = function (colSpan) {
        if (colSpan < 2) {
            return this.colYs;
        }
        var colGroup = [];
        var groupCount = this.cols + 1 - colSpan;
        for (var i = 0; i < groupCount; i++) {
            var groupColYs = this.colYs.slice(i, i + colSpan);
            colGroup[i] = Math.max.apply(Math, groupColYs);
        }
        return colGroup;
    };
    Masonry.prototype._manageStamp = function (stamp) {
        var stampSize = getSize(stamp);
        var offset = this._getElementOffset(stamp);
        var firstX = this.options.isOriginLeft ? offset.left : offset.right;
        var lastX = firstX + stampSize.outerWidth;
        var firstCol = Math.floor(firstX / this.columnWidth);
        firstCol = Math.max(0, firstCol);
        var lastCol = Math.floor(lastX / this.columnWidth);
        lastCol -= lastX % this.columnWidth ? 0 : 1;
        lastCol = Math.min(this.cols - 1, lastCol);
        var stampMaxY = (this.options.isOriginTop ? offset.top : offset.bottom) + stampSize.outerHeight;
        for (var i = firstCol; i <= lastCol; i++) {
            this.colYs[i] = Math.max(stampMaxY, this.colYs[i]);
        }
    };
    Masonry.prototype._getContainerSize = function () {
        this.maxY = Math.max.apply(Math, this.colYs);
        var size = { height: this.maxY };
        if (this.options.isFitWidth) {
            size.width = this._getContainerFitWidth();
        }
        return size;
    };
    Masonry.prototype._getContainerFitWidth = function () {
        var unusedCols = 0;
        var i = this.cols;
        while (--i) {
            if (this.colYs[i] !== 0) {
                break;
            }
            unusedCols++;
        }
        return (this.cols - unusedCols) * this.columnWidth - this.gutter;
    };
    Masonry.prototype.needsResizeLayout = function () {
        var previousWidth = this.containerWidth;
        this.getContainerWidth();
        return previousWidth !== this.containerWidth;
    };
    return Masonry;
}));
(function () {
    (function (window, factory) {
        'use strict';
        if (typeof define === 'function' && define.amd) {
            define('imagesloaded', [
                'app/bower_components/eventEmitter/EventEmitter',
                'app/bower_components/eventie/eventie',
                'jquery'
            ], function (EventEmitter, eventie) {
                return factory(window, EventEmitter, eventie);
            });
        } else if (typeof exports === 'object') {
            module.exports = factory(window, require('wolfy87-eventemitter'), require('eventie'));
        } else {
            window.imagesLoaded = factory(window, window.EventEmitter, window.eventie);
        }
    }(window, function factory(window, EventEmitter, eventie) {
        'use strict';
        var $ = window.jQuery;
        var console = window.console;
        var hasConsole = typeof console !== 'undefined';
        function extend(a, b) {
            for (var prop in b) {
                a[prop] = b[prop];
            }
            return a;
        }
        var objToString = Object.prototype.toString;
        function isArray(obj) {
            return objToString.call(obj) === '[object Array]';
        }
        function makeArray(obj) {
            var ary = [];
            if (isArray(obj)) {
                ary = obj;
            } else if (typeof obj.length === 'number') {
                for (var i = 0, len = obj.length; i < len; i++) {
                    ary.push(obj[i]);
                }
            } else {
                ary.push(obj);
            }
            return ary;
        }
        function ImagesLoaded(elem, options, onAlways) {
            if (!(this instanceof ImagesLoaded)) {
                return new ImagesLoaded(elem, options);
            }
            if (typeof elem === 'string') {
                elem = document.querySelectorAll(elem);
            }
            this.elements = makeArray(elem);
            this.options = extend({}, this.options);
            if (typeof options === 'function') {
                onAlways = options;
            } else {
                extend(this.options, options);
            }
            if (onAlways) {
                this.on('always', onAlways);
            }
            this.getImages();
            if ($) {
                this.jqDeferred = new $.Deferred();
            }
            var _this = this;
            setTimeout(function () {
                _this.check();
            });
        }
        ImagesLoaded.prototype = new EventEmitter();
        ImagesLoaded.prototype.options = {};
        ImagesLoaded.prototype.getImages = function () {
            this.images = [];
            for (var i = 0, len = this.elements.length; i < len; i++) {
                var elem = this.elements[i];
                if (elem.nodeName === 'IMG') {
                    this.addImage(elem);
                }
                var nodeType = elem.nodeType;
                if (!nodeType || !(nodeType === 1 || nodeType === 9 || nodeType === 11)) {
                    continue;
                }
                var childElems = elem.querySelectorAll('img');
                for (var j = 0, jLen = childElems.length; j < jLen; j++) {
                    var img = childElems[j];
                    this.addImage(img);
                }
            }
        };
        ImagesLoaded.prototype.addImage = function (img) {
            var loadingImage = new LoadingImage(img);
            this.images.push(loadingImage);
        };
        ImagesLoaded.prototype.check = function () {
            var _this = this;
            var checkedCount = 0;
            var length = this.images.length;
            this.hasAnyBroken = false;
            if (!length) {
                this.complete();
                return;
            }
            function onConfirm(image, message) {
                if (_this.options.debug && hasConsole) {
                    console.log('confirm', image, message);
                }
                _this.progress(image);
                checkedCount++;
                if (checkedCount === length) {
                    _this.complete();
                }
                return true;
            }
            for (var i = 0; i < length; i++) {
                var loadingImage = this.images[i];
                loadingImage.on('confirm', onConfirm);
                loadingImage.check();
            }
        };
        ImagesLoaded.prototype.progress = function (image) {
            this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
            var _this = this;
            setTimeout(function () {
                _this.emit('progress', _this, image);
                if (_this.jqDeferred && _this.jqDeferred.notify) {
                    _this.jqDeferred.notify(_this, image);
                }
            });
        };
        ImagesLoaded.prototype.complete = function () {
            var eventName = this.hasAnyBroken ? 'fail' : 'done';
            this.isComplete = true;
            var _this = this;
            setTimeout(function () {
                _this.emit(eventName, _this);
                _this.emit('always', _this);
                if (_this.jqDeferred) {
                    var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
                    _this.jqDeferred[jqMethod](_this);
                }
            });
        };
        if ($) {
            $.fn.imagesLoaded = function (options, callback) {
                var instance = new ImagesLoaded(this, options, callback);
                return instance.jqDeferred.promise($(this));
            };
        }
        function LoadingImage(img) {
            this.img = img;
        }
        LoadingImage.prototype = new EventEmitter();
        LoadingImage.prototype.check = function () {
            var resource = cache[this.img.src] || new Resource(this.img.src);
            if (resource.isConfirmed) {
                this.confirm(resource.isLoaded, 'cached was confirmed');
                return;
            }
            if (this.img.complete && this.img.naturalWidth !== undefined) {
                this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
                return;
            }
            var _this = this;
            resource.on('confirm', function (resrc, message) {
                _this.confirm(resrc.isLoaded, message);
                return true;
            });
            resource.check();
        };
        LoadingImage.prototype.confirm = function (isLoaded, message) {
            this.isLoaded = isLoaded;
            this.emit('confirm', this, message);
        };
        var cache = {};
        function Resource(src) {
            this.src = src;
            cache[src] = this;
        }
        Resource.prototype = new EventEmitter();
        Resource.prototype.check = function () {
            if (this.isChecked) {
                return;
            }
            var proxyImage = new Image();
            eventie.bind(proxyImage, 'load', this);
            eventie.bind(proxyImage, 'error', this);
            proxyImage.src = this.src;
            this.isChecked = true;
        };
        Resource.prototype.handleEvent = function (event) {
            var method = 'on' + event.type;
            if (this[method]) {
                this[method](event);
            }
        };
        Resource.prototype.onload = function (event) {
            this.confirm(true, 'onload');
            this.unbindProxyEvents(event);
        };
        Resource.prototype.onerror = function (event) {
            this.confirm(false, 'onerror');
            this.unbindProxyEvents(event);
        };
        Resource.prototype.confirm = function (isLoaded, message) {
            this.isConfirmed = true;
            this.isLoaded = isLoaded;
            this.emit('confirm', this, message);
        };
        Resource.prototype.unbindProxyEvents = function (event) {
            eventie.unbind(event.target, 'load', this);
            eventie.unbind(event.target, 'error', this);
        };
        return ImagesLoaded;
    }));
}.call(this));
(function (window) {
    'use strict';
    var slice = Array.prototype.slice;
    function noop() {
    }
    function defineBridget($) {
        if (!$) {
            return;
        }
        function addOptionMethod(PluginClass) {
            if (PluginClass.prototype.option) {
                return;
            }
            PluginClass.prototype.option = function (opts) {
                if (!$.isPlainObject(opts)) {
                    return;
                }
                this.options = $.extend(true, this.options, opts);
            };
        }
        var logError = typeof console === 'undefined' ? noop : function (message) {
            console.error(message);
        };
        function bridge(namespace, PluginClass) {
            $.fn[namespace] = function (options) {
                if (typeof options === 'string') {
                    var args = slice.call(arguments, 1);
                    for (var i = 0, len = this.length; i < len; i++) {
                        var elem = this[i];
                        var instance = $.data(elem, namespace);
                        if (!instance) {
                            logError('cannot call methods on ' + namespace + ' prior to initialization; ' + 'attempted to call \'' + options + '\'');
                            continue;
                        }
                        if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                            logError('no such method \'' + options + '\' for ' + namespace + ' instance');
                            continue;
                        }
                        var returnValue = instance[options].apply(instance, args);
                        if (returnValue !== undefined) {
                            return returnValue;
                        }
                    }
                    return this;
                } else {
                    return this.each(function () {
                        var instance = $.data(this, namespace);
                        if (instance) {
                            instance.option(options);
                            instance._init();
                        } else {
                            instance = new PluginClass(this, options);
                            $.data(this, namespace, instance);
                        }
                    });
                }
            };
        }
        $.bridget = function (namespace, PluginClass) {
            addOptionMethod(PluginClass);
            bridge(namespace, PluginClass);
        };
        return $.bridget;
    }
    if (typeof define === 'function' && define.amd) {
        define('jquery-bridget', ['jquery'], defineBridget);
    } else if (typeof exports === 'object') {
        defineBridget(require('jquery'));
    } else {
        defineBridget(window.jQuery);
    }
}(window));
define('views/insta', [
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'instatag',
    'collections/instaItem',
    'masonry',
    'imagesloaded',
    'jquery-bridget'
], function ($, _, Backbone, JST, Instatag, InstaItemCollection, Masonry) {
    'use strict';
    var InstaView = Backbone.View.extend({
        template: JST['app/scripts/templates/insta'],
        el: '#insta',
        events: {},
        initialize: function () {
            var self = this;
            self.SATURATION = 100;
            $.bridget('masonry', Masonry);
            var insta = new Instatag({
                clientId: '7027c1eb932241d18d7c0c702794a5bb',
                tags: [
                    'beanbrothers',
                    '\uBE48\uBE0C\uB77C\uB354\uC2A4',
                    'bean_brothers'
                ],
                count: 10,
                success: function (result) {
                    self.container = result;
                    self.updateView.apply(self);
                }
            });
            insta.send();
            self.listenTo(self.collection, 'reset', function () {
                self.render();
            });
        },
        render: function () {
            var self = this;
            var $el = $(self.el);
            $el.children('.wrapper').remove();
            $el.append(this.template({
                instaData: this.collection.toJSON(),
                SATURATION: this.SATURATION
            }));
            var $wrapper = $el.children('.wrapper');
            $wrapper.hide();
            var $loading = $el.children('.loading');
            $el.imagesLoaded(function () {
                var $masonry = $wrapper;
                $masonry.fadeIn();
                $loading.hide();
                var msnry = $masonry.data('masonry');
                if (msnry) {
                }
                $masonry.masonry({
                    itemSelector: '.insta-item',
                    columnWidth: '.item-small'
                });
            });
            return this;
        },
        updateView: function () {
            var self = this;
            if ($(window).width() < 767) {
                self.collection.reset(self.makeFit(self.container, 24));
            } else {
                self.collection.reset(self.makeFit(self.container, 48));
            }
        },
        makeFit: function (data, count) {
            var self = this;
            var result = [];
            $.each(data, function (idx, value) {
                var size;
                if (value.likes.count > self.SATURATION && count > 11) {
                    size = 4;
                    value.putViewSize = 'big';
                } else {
                    size = 1;
                    value.putViewSize = 'small';
                }
                count -= size;
                if (count < 0) {
                    return false;
                } else {
                    result[result.length] = value;
                }
            });
            return result;
        }
    });
    return InstaView;
});
define('routes/app', [
    'jquery',
    'backbone',
    'views/insta',
    'imagesloaded'
], function ($, Backbone, InstaView) {
    'use strict';
    var AppRouter = Backbone.Router.extend({
        initialize: function () {
            $('body').on('click', 'a:not(a[data-bypass])', function (e) {
                e.preventDefault();
                var href = $(this).attr('href');
                Backbone.history.navigate(href, true);
            });
        },
        routes: {
            '': 'root#index',
            'index': 'root#index',
            'class': 'class#index',
            'product': 'product#index'
        },
        'root#index': function () {
            var self = this;
            var $paperWrapper = $('#paper .wrapper');
            var $banner = $('#banner');
            var $bannerArea = $('#banner-area');
            this.closeNav(function () {
                self.fetchTemplate('index-banner', function () {
                    $bannerArea.animate({ height: self.bannerHeight() }, 'easeIn', function () {
                        $banner.html(JST['index-banner']());
                    });
                    self.fetchTemplate('index-paper', function () {
                        $paperWrapper.fadeOut(function () {
                            $paperWrapper.html(JST['index-paper']());
                            $paperWrapper.imagesLoaded().done(function () {
                                $paperWrapper.fadeIn();
                            });
                        });
                    });
                });
            });
        },
        'class#index': function () {
            var self = this;
            var $paper = $('#paper');
            var $paperWrapper = $('#paper .wrapper');
            var $banner = $('#banner');
            var $bannerArea = $('#banner-area');
            this.closeNav(function () {
                $bannerArea.animate({ height: 50 });
                $paperWrapper.fadeOut(function () {
                    $banner.html('');
                    self.fetchTemplate('class-paper', function () {
                        $paperWrapper.html(JST['class-paper']());
                        $paperWrapper.imagesLoaded().done(function () {
                            $paperWrapper.fadeIn();
                        });
                    });
                });
            });
        },
        'product#index': function () {
        },
        fetchTemplate: function (path, done) {
            var JST = window.JST = window.JST || {};
            var def = new $.Deferred();
            if (JST[path]) {
                if (_.isFunction(done)) {
                    done(JST[path]);
                }
                return def.resolve(JST[path]);
            }
            return def.promise();
        },
        closeNav: function (cb) {
            var $mobileNav = $('#mobile-nav');
            $mobileNav.collapse('hide');
            setTimeout(cb, 300);
        },
        bannerHeight: function () {
            var headerHeight = 50;
            var width = $(window).width();
            if (width < 768) {
                return 240 + headerHeight;
            } else if (width < 992) {
                return 300 + headerHeight;
            } else if (width < 1200) {
                return 400 + headerHeight;
            } else {
                return 450 + headerHeight;
            }
        }
    });
    return AppRouter;
});
define('bootstrap', ['jquery'], function () {
    if (typeof jQuery === 'undefined') {
        throw new Error('Bootstrap\'s JavaScript requires jQuery');
    }
    +function ($) {
        'use strict';
        var version = $.fn.jquery.split(' ')[0].split('.');
        if (version[0] < 2 && version[1] < 9 || version[0] == 1 && version[1] == 9 && version[2] < 1) {
            throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher');
        }
    }(jQuery);
    +function ($) {
        'use strict';
        function transitionEnd() {
            var el = document.createElement('bootstrap');
            var transEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend',
                transition: 'transitionend'
            };
            for (var name in transEndEventNames) {
                if (el.style[name] !== undefined) {
                    return { end: transEndEventNames[name] };
                }
            }
            return false;
        }
        $.fn.emulateTransitionEnd = function (duration) {
            var called = false;
            var $el = this;
            $(this).one('bsTransitionEnd', function () {
                called = true;
            });
            var callback = function () {
                if (!called)
                    $($el).trigger($.support.transition.end);
            };
            setTimeout(callback, duration);
            return this;
        };
        $(function () {
            $.support.transition = transitionEnd();
            if (!$.support.transition)
                return;
            $.event.special.bsTransitionEnd = {
                bindType: $.support.transition.end,
                delegateType: $.support.transition.end,
                handle: function (e) {
                    if ($(e.target).is(this))
                        return e.handleObj.handler.apply(this, arguments);
                }
            };
        });
    }(jQuery);
    +function ($) {
        'use strict';
        var dismiss = '[data-dismiss="alert"]';
        var Alert = function (el) {
            $(el).on('click', dismiss, this.close);
        };
        Alert.VERSION = '3.3.4';
        Alert.TRANSITION_DURATION = 150;
        Alert.prototype.close = function (e) {
            var $this = $(this);
            var selector = $this.attr('data-target');
            if (!selector) {
                selector = $this.attr('href');
                selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
            }
            var $parent = $(selector);
            if (e)
                e.preventDefault();
            if (!$parent.length) {
                $parent = $this.closest('.alert');
            }
            $parent.trigger(e = $.Event('close.bs.alert'));
            if (e.isDefaultPrevented())
                return;
            $parent.removeClass('in');
            function removeElement() {
                $parent.detach().trigger('closed.bs.alert').remove();
            }
            $.support.transition && $parent.hasClass('fade') ? $parent.one('bsTransitionEnd', removeElement).emulateTransitionEnd(Alert.TRANSITION_DURATION) : removeElement();
        };
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.alert');
                if (!data)
                    $this.data('bs.alert', data = new Alert(this));
                if (typeof option == 'string')
                    data[option].call($this);
            });
        }
        var old = $.fn.alert;
        $.fn.alert = Plugin;
        $.fn.alert.Constructor = Alert;
        $.fn.alert.noConflict = function () {
            $.fn.alert = old;
            return this;
        };
        $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close);
    }(jQuery);
    +function ($) {
        'use strict';
        var Button = function (element, options) {
            this.$element = $(element);
            this.options = $.extend({}, Button.DEFAULTS, options);
            this.isLoading = false;
        };
        Button.VERSION = '3.3.4';
        Button.DEFAULTS = { loadingText: 'loading...' };
        Button.prototype.setState = function (state) {
            var d = 'disabled';
            var $el = this.$element;
            var val = $el.is('input') ? 'val' : 'html';
            var data = $el.data();
            state = state + 'Text';
            if (data.resetText == null)
                $el.data('resetText', $el[val]());
            setTimeout($.proxy(function () {
                $el[val](data[state] == null ? this.options[state] : data[state]);
                if (state == 'loadingText') {
                    this.isLoading = true;
                    $el.addClass(d).attr(d, d);
                } else if (this.isLoading) {
                    this.isLoading = false;
                    $el.removeClass(d).removeAttr(d);
                }
            }, this), 0);
        };
        Button.prototype.toggle = function () {
            var changed = true;
            var $parent = this.$element.closest('[data-toggle="buttons"]');
            if ($parent.length) {
                var $input = this.$element.find('input');
                if ($input.prop('type') == 'radio') {
                    if ($input.prop('checked') && this.$element.hasClass('active'))
                        changed = false;
                    else
                        $parent.find('.active').removeClass('active');
                }
                if (changed)
                    $input.prop('checked', !this.$element.hasClass('active')).trigger('change');
            } else {
                this.$element.attr('aria-pressed', !this.$element.hasClass('active'));
            }
            if (changed)
                this.$element.toggleClass('active');
        };
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.button');
                var options = typeof option == 'object' && option;
                if (!data)
                    $this.data('bs.button', data = new Button(this, options));
                if (option == 'toggle')
                    data.toggle();
                else if (option)
                    data.setState(option);
            });
        }
        var old = $.fn.button;
        $.fn.button = Plugin;
        $.fn.button.Constructor = Button;
        $.fn.button.noConflict = function () {
            $.fn.button = old;
            return this;
        };
        $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
            var $btn = $(e.target);
            if (!$btn.hasClass('btn'))
                $btn = $btn.closest('.btn');
            Plugin.call($btn, 'toggle');
            e.preventDefault();
        }).on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
            $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type));
        });
    }(jQuery);
    +function ($) {
        'use strict';
        var Carousel = function (element, options) {
            this.$element = $(element);
            this.$indicators = this.$element.find('.carousel-indicators');
            this.options = options;
            this.paused = null;
            this.sliding = null;
            this.interval = null;
            this.$active = null;
            this.$items = null;
            this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this));
            this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element.on('mouseenter.bs.carousel', $.proxy(this.pause, this)).on('mouseleave.bs.carousel', $.proxy(this.cycle, this));
        };
        Carousel.VERSION = '3.3.4';
        Carousel.TRANSITION_DURATION = 600;
        Carousel.DEFAULTS = {
            interval: 5000,
            pause: 'hover',
            wrap: true,
            keyboard: true
        };
        Carousel.prototype.keydown = function (e) {
            if (/input|textarea/i.test(e.target.tagName))
                return;
            switch (e.which) {
            case 37:
                this.prev();
                break;
            case 39:
                this.next();
                break;
            default:
                return;
            }
            e.preventDefault();
        };
        Carousel.prototype.cycle = function (e) {
            e || (this.paused = false);
            this.interval && clearInterval(this.interval);
            this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
            return this;
        };
        Carousel.prototype.getItemIndex = function (item) {
            this.$items = item.parent().children('.item');
            return this.$items.index(item || this.$active);
        };
        Carousel.prototype.getItemForDirection = function (direction, active) {
            var activeIndex = this.getItemIndex(active);
            var willWrap = direction == 'prev' && activeIndex === 0 || direction == 'next' && activeIndex == this.$items.length - 1;
            if (willWrap && !this.options.wrap)
                return active;
            var delta = direction == 'prev' ? -1 : 1;
            var itemIndex = (activeIndex + delta) % this.$items.length;
            return this.$items.eq(itemIndex);
        };
        Carousel.prototype.to = function (pos) {
            var that = this;
            var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'));
            if (pos > this.$items.length - 1 || pos < 0)
                return;
            if (this.sliding)
                return this.$element.one('slid.bs.carousel', function () {
                    that.to(pos);
                });
            if (activeIndex == pos)
                return this.pause().cycle();
            return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos));
        };
        Carousel.prototype.pause = function (e) {
            e || (this.paused = true);
            if (this.$element.find('.next, .prev').length && $.support.transition) {
                this.$element.trigger($.support.transition.end);
                this.cycle(true);
            }
            this.interval = clearInterval(this.interval);
            return this;
        };
        Carousel.prototype.next = function () {
            if (this.sliding)
                return;
            return this.slide('next');
        };
        Carousel.prototype.prev = function () {
            if (this.sliding)
                return;
            return this.slide('prev');
        };
        Carousel.prototype.slide = function (type, next) {
            var $active = this.$element.find('.item.active');
            var $next = next || this.getItemForDirection(type, $active);
            var isCycling = this.interval;
            var direction = type == 'next' ? 'left' : 'right';
            var that = this;
            if ($next.hasClass('active'))
                return this.sliding = false;
            var relatedTarget = $next[0];
            var slideEvent = $.Event('slide.bs.carousel', {
                relatedTarget: relatedTarget,
                direction: direction
            });
            this.$element.trigger(slideEvent);
            if (slideEvent.isDefaultPrevented())
                return;
            this.sliding = true;
            isCycling && this.pause();
            if (this.$indicators.length) {
                this.$indicators.find('.active').removeClass('active');
                var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
                $nextIndicator && $nextIndicator.addClass('active');
            }
            var slidEvent = $.Event('slid.bs.carousel', {
                relatedTarget: relatedTarget,
                direction: direction
            });
            if ($.support.transition && this.$element.hasClass('slide')) {
                $next.addClass(type);
                $next[0].offsetWidth;
                $active.addClass(direction);
                $next.addClass(direction);
                $active.one('bsTransitionEnd', function () {
                    $next.removeClass([
                        type,
                        direction
                    ].join(' ')).addClass('active');
                    $active.removeClass([
                        'active',
                        direction
                    ].join(' '));
                    that.sliding = false;
                    setTimeout(function () {
                        that.$element.trigger(slidEvent);
                    }, 0);
                }).emulateTransitionEnd(Carousel.TRANSITION_DURATION);
            } else {
                $active.removeClass('active');
                $next.addClass('active');
                this.sliding = false;
                this.$element.trigger(slidEvent);
            }
            isCycling && this.cycle();
            return this;
        };
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.carousel');
                var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option);
                var action = typeof option == 'string' ? option : options.slide;
                if (!data)
                    $this.data('bs.carousel', data = new Carousel(this, options));
                if (typeof option == 'number')
                    data.to(option);
                else if (action)
                    data[action]();
                else if (options.interval)
                    data.pause().cycle();
            });
        }
        var old = $.fn.carousel;
        $.fn.carousel = Plugin;
        $.fn.carousel.Constructor = Carousel;
        $.fn.carousel.noConflict = function () {
            $.fn.carousel = old;
            return this;
        };
        var clickHandler = function (e) {
            var href;
            var $this = $(this);
            var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''));
            if (!$target.hasClass('carousel'))
                return;
            var options = $.extend({}, $target.data(), $this.data());
            var slideIndex = $this.attr('data-slide-to');
            if (slideIndex)
                options.interval = false;
            Plugin.call($target, options);
            if (slideIndex) {
                $target.data('bs.carousel').to(slideIndex);
            }
            e.preventDefault();
        };
        $(document).on('click.bs.carousel.data-api', '[data-slide]', clickHandler).on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler);
        $(window).on('load', function () {
            $('[data-ride="carousel"]').each(function () {
                var $carousel = $(this);
                Plugin.call($carousel, $carousel.data());
            });
        });
    }(jQuery);
    +function ($) {
        'use strict';
        var Collapse = function (element, options) {
            this.$element = $(element);
            this.options = $.extend({}, Collapse.DEFAULTS, options);
            this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' + '[data-toggle="collapse"][data-target="#' + element.id + '"]');
            this.transitioning = null;
            if (this.options.parent) {
                this.$parent = this.getParent();
            } else {
                this.addAriaAndCollapsedClass(this.$element, this.$trigger);
            }
            if (this.options.toggle)
                this.toggle();
        };
        Collapse.VERSION = '3.3.4';
        Collapse.TRANSITION_DURATION = 350;
        Collapse.DEFAULTS = { toggle: true };
        Collapse.prototype.dimension = function () {
            var hasWidth = this.$element.hasClass('width');
            return hasWidth ? 'width' : 'height';
        };
        Collapse.prototype.show = function () {
            if (this.transitioning || this.$element.hasClass('in'))
                return;
            var activesData;
            var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing');
            if (actives && actives.length) {
                activesData = actives.data('bs.collapse');
                if (activesData && activesData.transitioning)
                    return;
            }
            var startEvent = $.Event('show.bs.collapse');
            this.$element.trigger(startEvent);
            if (startEvent.isDefaultPrevented())
                return;
            if (actives && actives.length) {
                Plugin.call(actives, 'hide');
                activesData || actives.data('bs.collapse', null);
            }
            var dimension = this.dimension();
            this.$element.removeClass('collapse').addClass('collapsing')[dimension](0).attr('aria-expanded', true);
            this.$trigger.removeClass('collapsed').attr('aria-expanded', true);
            this.transitioning = 1;
            var complete = function () {
                this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('');
                this.transitioning = 0;
                this.$element.trigger('shown.bs.collapse');
            };
            if (!$.support.transition)
                return complete.call(this);
            var scrollSize = $.camelCase([
                'scroll',
                dimension
            ].join('-'));
            this.$element.one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize]);
        };
        Collapse.prototype.hide = function () {
            if (this.transitioning || !this.$element.hasClass('in'))
                return;
            var startEvent = $.Event('hide.bs.collapse');
            this.$element.trigger(startEvent);
            if (startEvent.isDefaultPrevented())
                return;
            var dimension = this.dimension();
            this.$element[dimension](this.$element[dimension]())[0].offsetHeight;
            this.$element.addClass('collapsing').removeClass('collapse in').attr('aria-expanded', false);
            this.$trigger.addClass('collapsed').attr('aria-expanded', false);
            this.transitioning = 1;
            var complete = function () {
                this.transitioning = 0;
                this.$element.removeClass('collapsing').addClass('collapse').trigger('hidden.bs.collapse');
            };
            if (!$.support.transition)
                return complete.call(this);
            this.$element[dimension](0).one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION);
        };
        Collapse.prototype.toggle = function () {
            this[this.$element.hasClass('in') ? 'hide' : 'show']();
        };
        Collapse.prototype.getParent = function () {
            return $(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each($.proxy(function (i, element) {
                var $element = $(element);
                this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element);
            }, this)).end();
        };
        Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
            var isOpen = $element.hasClass('in');
            $element.attr('aria-expanded', isOpen);
            $trigger.toggleClass('collapsed', !isOpen).attr('aria-expanded', isOpen);
        };
        function getTargetFromTrigger($trigger) {
            var href;
            var target = $trigger.attr('data-target') || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '');
            return $(target);
        }
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.collapse');
                var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option);
                if (!data && options.toggle && /show|hide/.test(option))
                    options.toggle = false;
                if (!data)
                    $this.data('bs.collapse', data = new Collapse(this, options));
                if (typeof option == 'string')
                    data[option]();
            });
        }
        var old = $.fn.collapse;
        $.fn.collapse = Plugin;
        $.fn.collapse.Constructor = Collapse;
        $.fn.collapse.noConflict = function () {
            $.fn.collapse = old;
            return this;
        };
        $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
            var $this = $(this);
            if (!$this.attr('data-target'))
                e.preventDefault();
            var $target = getTargetFromTrigger($this);
            var data = $target.data('bs.collapse');
            var option = data ? 'toggle' : $this.data();
            Plugin.call($target, option);
        });
    }(jQuery);
    +function ($) {
        'use strict';
        var backdrop = '.dropdown-backdrop';
        var toggle = '[data-toggle="dropdown"]';
        var Dropdown = function (element) {
            $(element).on('click.bs.dropdown', this.toggle);
        };
        Dropdown.VERSION = '3.3.4';
        Dropdown.prototype.toggle = function (e) {
            var $this = $(this);
            if ($this.is('.disabled, :disabled'))
                return;
            var $parent = getParent($this);
            var isActive = $parent.hasClass('open');
            clearMenus();
            if (!isActive) {
                if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                    $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
                }
                var relatedTarget = { relatedTarget: this };
                $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget));
                if (e.isDefaultPrevented())
                    return;
                $this.trigger('focus').attr('aria-expanded', 'true');
                $parent.toggleClass('open').trigger('shown.bs.dropdown', relatedTarget);
            }
            return false;
        };
        Dropdown.prototype.keydown = function (e) {
            if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName))
                return;
            var $this = $(this);
            e.preventDefault();
            e.stopPropagation();
            if ($this.is('.disabled, :disabled'))
                return;
            var $parent = getParent($this);
            var isActive = $parent.hasClass('open');
            if (!isActive && e.which != 27 || isActive && e.which == 27) {
                if (e.which == 27)
                    $parent.find(toggle).trigger('focus');
                return $this.trigger('click');
            }
            var desc = ' li:not(.disabled):visible a';
            var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc);
            if (!$items.length)
                return;
            var index = $items.index(e.target);
            if (e.which == 38 && index > 0)
                index--;
            if (e.which == 40 && index < $items.length - 1)
                index++;
            if (!~index)
                index = 0;
            $items.eq(index).trigger('focus');
        };
        function clearMenus(e) {
            if (e && e.which === 3)
                return;
            $(backdrop).remove();
            $(toggle).each(function () {
                var $this = $(this);
                var $parent = getParent($this);
                var relatedTarget = { relatedTarget: this };
                if (!$parent.hasClass('open'))
                    return;
                $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget));
                if (e.isDefaultPrevented())
                    return;
                $this.attr('aria-expanded', 'false');
                $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget);
            });
        }
        function getParent($this) {
            var selector = $this.attr('data-target');
            if (!selector) {
                selector = $this.attr('href');
                selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '');
            }
            var $parent = selector && $(selector);
            return $parent && $parent.length ? $parent : $this.parent();
        }
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.dropdown');
                if (!data)
                    $this.data('bs.dropdown', data = new Dropdown(this));
                if (typeof option == 'string')
                    data[option].call($this);
            });
        }
        var old = $.fn.dropdown;
        $.fn.dropdown = Plugin;
        $.fn.dropdown.Constructor = Dropdown;
        $.fn.dropdown.noConflict = function () {
            $.fn.dropdown = old;
            return this;
        };
        $(document).on('click.bs.dropdown.data-api', clearMenus).on('click.bs.dropdown.data-api', '.dropdown form', function (e) {
            e.stopPropagation();
        }).on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown).on('keydown.bs.dropdown.data-api', '[role="menu"]', Dropdown.prototype.keydown).on('keydown.bs.dropdown.data-api', '[role="listbox"]', Dropdown.prototype.keydown);
    }(jQuery);
    +function ($) {
        'use strict';
        var Modal = function (element, options) {
            this.options = options;
            this.$body = $(document.body);
            this.$element = $(element);
            this.$dialog = this.$element.find('.modal-dialog');
            this.$backdrop = null;
            this.isShown = null;
            this.originalBodyPad = null;
            this.scrollbarWidth = 0;
            this.ignoreBackdropClick = false;
            if (this.options.remote) {
                this.$element.find('.modal-content').load(this.options.remote, $.proxy(function () {
                    this.$element.trigger('loaded.bs.modal');
                }, this));
            }
        };
        Modal.VERSION = '3.3.4';
        Modal.TRANSITION_DURATION = 300;
        Modal.BACKDROP_TRANSITION_DURATION = 150;
        Modal.DEFAULTS = {
            backdrop: true,
            keyboard: true,
            show: true
        };
        Modal.prototype.toggle = function (_relatedTarget) {
            return this.isShown ? this.hide() : this.show(_relatedTarget);
        };
        Modal.prototype.show = function (_relatedTarget) {
            var that = this;
            var e = $.Event('show.bs.modal', { relatedTarget: _relatedTarget });
            this.$element.trigger(e);
            if (this.isShown || e.isDefaultPrevented())
                return;
            this.isShown = true;
            this.checkScrollbar();
            this.setScrollbar();
            this.$body.addClass('modal-open');
            this.escape();
            this.resize();
            this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));
            this.$dialog.on('mousedown.dismiss.bs.modal', function () {
                that.$element.one('mouseup.dismiss.bs.modal', function (e) {
                    if ($(e.target).is(that.$element))
                        that.ignoreBackdropClick = true;
                });
            });
            this.backdrop(function () {
                var transition = $.support.transition && that.$element.hasClass('fade');
                if (!that.$element.parent().length) {
                    that.$element.appendTo(that.$body);
                }
                that.$element.show().scrollTop(0);
                that.adjustDialog();
                if (transition) {
                    that.$element[0].offsetWidth;
                }
                that.$element.addClass('in').attr('aria-hidden', false);
                that.enforceFocus();
                var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget });
                transition ? that.$dialog.one('bsTransitionEnd', function () {
                    that.$element.trigger('focus').trigger(e);
                }).emulateTransitionEnd(Modal.TRANSITION_DURATION) : that.$element.trigger('focus').trigger(e);
            });
        };
        Modal.prototype.hide = function (e) {
            if (e)
                e.preventDefault();
            e = $.Event('hide.bs.modal');
            this.$element.trigger(e);
            if (!this.isShown || e.isDefaultPrevented())
                return;
            this.isShown = false;
            this.escape();
            this.resize();
            $(document).off('focusin.bs.modal');
            this.$element.removeClass('in').attr('aria-hidden', true).off('click.dismiss.bs.modal').off('mouseup.dismiss.bs.modal');
            this.$dialog.off('mousedown.dismiss.bs.modal');
            $.support.transition && this.$element.hasClass('fade') ? this.$element.one('bsTransitionEnd', $.proxy(this.hideModal, this)).emulateTransitionEnd(Modal.TRANSITION_DURATION) : this.hideModal();
        };
        Modal.prototype.enforceFocus = function () {
            $(document).off('focusin.bs.modal').on('focusin.bs.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.trigger('focus');
                }
            }, this));
        };
        Modal.prototype.escape = function () {
            if (this.isShown && this.options.keyboard) {
                this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
                    e.which == 27 && this.hide();
                }, this));
            } else if (!this.isShown) {
                this.$element.off('keydown.dismiss.bs.modal');
            }
        };
        Modal.prototype.resize = function () {
            if (this.isShown) {
                $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this));
            } else {
                $(window).off('resize.bs.modal');
            }
        };
        Modal.prototype.hideModal = function () {
            var that = this;
            this.$element.hide();
            this.backdrop(function () {
                that.$body.removeClass('modal-open');
                that.resetAdjustments();
                that.resetScrollbar();
                that.$element.trigger('hidden.bs.modal');
            });
        };
        Modal.prototype.removeBackdrop = function () {
            this.$backdrop && this.$backdrop.remove();
            this.$backdrop = null;
        };
        Modal.prototype.backdrop = function (callback) {
            var that = this;
            var animate = this.$element.hasClass('fade') ? 'fade' : '';
            if (this.isShown && this.options.backdrop) {
                var doAnimate = $.support.transition && animate;
                this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(this.$body);
                this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
                    if (this.ignoreBackdropClick) {
                        this.ignoreBackdropClick = false;
                        return;
                    }
                    if (e.target !== e.currentTarget)
                        return;
                    this.options.backdrop == 'static' ? this.$element[0].focus() : this.hide();
                }, this));
                if (doAnimate)
                    this.$backdrop[0].offsetWidth;
                this.$backdrop.addClass('in');
                if (!callback)
                    return;
                doAnimate ? this.$backdrop.one('bsTransitionEnd', callback).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callback();
            } else if (!this.isShown && this.$backdrop) {
                this.$backdrop.removeClass('in');
                var callbackRemove = function () {
                    that.removeBackdrop();
                    callback && callback();
                };
                $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one('bsTransitionEnd', callbackRemove).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callbackRemove();
            } else if (callback) {
                callback();
            }
        };
        Modal.prototype.handleUpdate = function () {
            this.adjustDialog();
        };
        Modal.prototype.adjustDialog = function () {
            var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;
            this.$element.css({
                paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
                paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
            });
        };
        Modal.prototype.resetAdjustments = function () {
            this.$element.css({
                paddingLeft: '',
                paddingRight: ''
            });
        };
        Modal.prototype.checkScrollbar = function () {
            var fullWindowWidth = window.innerWidth;
            if (!fullWindowWidth) {
                var documentElementRect = document.documentElement.getBoundingClientRect();
                fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
            }
            this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
            this.scrollbarWidth = this.measureScrollbar();
        };
        Modal.prototype.setScrollbar = function () {
            var bodyPad = parseInt(this.$body.css('padding-right') || 0, 10);
            this.originalBodyPad = document.body.style.paddingRight || '';
            if (this.bodyIsOverflowing)
                this.$body.css('padding-right', bodyPad + this.scrollbarWidth);
        };
        Modal.prototype.resetScrollbar = function () {
            this.$body.css('padding-right', this.originalBodyPad);
        };
        Modal.prototype.measureScrollbar = function () {
            var scrollDiv = document.createElement('div');
            scrollDiv.className = 'modal-scrollbar-measure';
            this.$body.append(scrollDiv);
            var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            this.$body[0].removeChild(scrollDiv);
            return scrollbarWidth;
        };
        function Plugin(option, _relatedTarget) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.modal');
                var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);
                if (!data)
                    $this.data('bs.modal', data = new Modal(this, options));
                if (typeof option == 'string')
                    data[option](_relatedTarget);
                else if (options.show)
                    data.show(_relatedTarget);
            });
        }
        var old = $.fn.modal;
        $.fn.modal = Plugin;
        $.fn.modal.Constructor = Modal;
        $.fn.modal.noConflict = function () {
            $.fn.modal = old;
            return this;
        };
        $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
            var $this = $(this);
            var href = $this.attr('href');
            var $target = $($this.attr('data-target') || href && href.replace(/.*(?=#[^\s]+$)/, ''));
            var option = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());
            if ($this.is('a'))
                e.preventDefault();
            $target.one('show.bs.modal', function (showEvent) {
                if (showEvent.isDefaultPrevented())
                    return;
                $target.one('hidden.bs.modal', function () {
                    $this.is(':visible') && $this.trigger('focus');
                });
            });
            Plugin.call($target, option, this);
        });
    }(jQuery);
    +function ($) {
        'use strict';
        var Tooltip = function (element, options) {
            this.type = null;
            this.options = null;
            this.enabled = null;
            this.timeout = null;
            this.hoverState = null;
            this.$element = null;
            this.init('tooltip', element, options);
        };
        Tooltip.VERSION = '3.3.4';
        Tooltip.TRANSITION_DURATION = 150;
        Tooltip.DEFAULTS = {
            animation: true,
            placement: 'top',
            selector: false,
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
            trigger: 'hover focus',
            title: '',
            delay: 0,
            html: false,
            container: false,
            viewport: {
                selector: 'body',
                padding: 0
            }
        };
        Tooltip.prototype.init = function (type, element, options) {
            this.enabled = true;
            this.type = type;
            this.$element = $(element);
            this.options = this.getOptions(options);
            this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport);
            if (this.$element[0] instanceof document.constructor && !this.options.selector) {
                throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!');
            }
            var triggers = this.options.trigger.split(' ');
            for (var i = triggers.length; i--;) {
                var trigger = triggers[i];
                if (trigger == 'click') {
                    this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
                } else if (trigger != 'manual') {
                    var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
                    var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';
                    this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                    this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
                }
            }
            this.options.selector ? this._options = $.extend({}, this.options, {
                trigger: 'manual',
                selector: ''
            }) : this.fixTitle();
        };
        Tooltip.prototype.getDefaults = function () {
            return Tooltip.DEFAULTS;
        };
        Tooltip.prototype.getOptions = function (options) {
            options = $.extend({}, this.getDefaults(), this.$element.data(), options);
            if (options.delay && typeof options.delay == 'number') {
                options.delay = {
                    show: options.delay,
                    hide: options.delay
                };
            }
            return options;
        };
        Tooltip.prototype.getDelegateOptions = function () {
            var options = {};
            var defaults = this.getDefaults();
            this._options && $.each(this._options, function (key, value) {
                if (defaults[key] != value)
                    options[key] = value;
            });
            return options;
        };
        Tooltip.prototype.enter = function (obj) {
            var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);
            if (self && self.$tip && self.$tip.is(':visible')) {
                self.hoverState = 'in';
                return;
            }
            if (!self) {
                self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                $(obj.currentTarget).data('bs.' + this.type, self);
            }
            clearTimeout(self.timeout);
            self.hoverState = 'in';
            if (!self.options.delay || !self.options.delay.show)
                return self.show();
            self.timeout = setTimeout(function () {
                if (self.hoverState == 'in')
                    self.show();
            }, self.options.delay.show);
        };
        Tooltip.prototype.leave = function (obj) {
            var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);
            if (!self) {
                self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                $(obj.currentTarget).data('bs.' + this.type, self);
            }
            clearTimeout(self.timeout);
            self.hoverState = 'out';
            if (!self.options.delay || !self.options.delay.hide)
                return self.hide();
            self.timeout = setTimeout(function () {
                if (self.hoverState == 'out')
                    self.hide();
            }, self.options.delay.hide);
        };
        Tooltip.prototype.show = function () {
            var e = $.Event('show.bs.' + this.type);
            if (this.hasContent() && this.enabled) {
                this.$element.trigger(e);
                var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
                if (e.isDefaultPrevented() || !inDom)
                    return;
                var that = this;
                var $tip = this.tip();
                var tipId = this.getUID(this.type);
                this.setContent();
                $tip.attr('id', tipId);
                this.$element.attr('aria-describedby', tipId);
                if (this.options.animation)
                    $tip.addClass('fade');
                var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
                var autoToken = /\s?auto?\s?/i;
                var autoPlace = autoToken.test(placement);
                if (autoPlace)
                    placement = placement.replace(autoToken, '') || 'top';
                $tip.detach().css({
                    top: 0,
                    left: 0,
                    display: 'block'
                }).addClass(placement).data('bs.' + this.type, this);
                this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
                var pos = this.getPosition();
                var actualWidth = $tip[0].offsetWidth;
                var actualHeight = $tip[0].offsetHeight;
                if (autoPlace) {
                    var orgPlacement = placement;
                    var $container = this.options.container ? $(this.options.container) : this.$element.parent();
                    var containerDim = this.getPosition($container);
                    placement = placement == 'bottom' && pos.bottom + actualHeight > containerDim.bottom ? 'top' : placement == 'top' && pos.top - actualHeight < containerDim.top ? 'bottom' : placement == 'right' && pos.right + actualWidth > containerDim.width ? 'left' : placement == 'left' && pos.left - actualWidth < containerDim.left ? 'right' : placement;
                    $tip.removeClass(orgPlacement).addClass(placement);
                }
                var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
                this.applyPlacement(calculatedOffset, placement);
                var complete = function () {
                    var prevHoverState = that.hoverState;
                    that.$element.trigger('shown.bs.' + that.type);
                    that.hoverState = null;
                    if (prevHoverState == 'out')
                        that.leave(that);
                };
                $.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
            }
        };
        Tooltip.prototype.applyPlacement = function (offset, placement) {
            var $tip = this.tip();
            var width = $tip[0].offsetWidth;
            var height = $tip[0].offsetHeight;
            var marginTop = parseInt($tip.css('margin-top'), 10);
            var marginLeft = parseInt($tip.css('margin-left'), 10);
            if (isNaN(marginTop))
                marginTop = 0;
            if (isNaN(marginLeft))
                marginLeft = 0;
            offset.top = offset.top + marginTop;
            offset.left = offset.left + marginLeft;
            $.offset.setOffset($tip[0], $.extend({
                using: function (props) {
                    $tip.css({
                        top: Math.round(props.top),
                        left: Math.round(props.left)
                    });
                }
            }, offset), 0);
            $tip.addClass('in');
            var actualWidth = $tip[0].offsetWidth;
            var actualHeight = $tip[0].offsetHeight;
            if (placement == 'top' && actualHeight != height) {
                offset.top = offset.top + height - actualHeight;
            }
            var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);
            if (delta.left)
                offset.left += delta.left;
            else
                offset.top += delta.top;
            var isVertical = /top|bottom/.test(placement);
            var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
            var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';
            $tip.offset(offset);
            this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical);
        };
        Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
            this.arrow().css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%').css(isVertical ? 'top' : 'left', '');
        };
        Tooltip.prototype.setContent = function () {
            var $tip = this.tip();
            var title = this.getTitle();
            $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
            $tip.removeClass('fade in top bottom left right');
        };
        Tooltip.prototype.hide = function (callback) {
            var that = this;
            var $tip = $(this.$tip);
            var e = $.Event('hide.bs.' + this.type);
            function complete() {
                if (that.hoverState != 'in')
                    $tip.detach();
                that.$element.removeAttr('aria-describedby').trigger('hidden.bs.' + that.type);
                callback && callback();
            }
            this.$element.trigger(e);
            if (e.isDefaultPrevented())
                return;
            $tip.removeClass('in');
            $.support.transition && $tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
            this.hoverState = null;
            return this;
        };
        Tooltip.prototype.fixTitle = function () {
            var $e = this.$element;
            if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
                $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
            }
        };
        Tooltip.prototype.hasContent = function () {
            return this.getTitle();
        };
        Tooltip.prototype.getPosition = function ($element) {
            $element = $element || this.$element;
            var el = $element[0];
            var isBody = el.tagName == 'BODY';
            var elRect = el.getBoundingClientRect();
            if (elRect.width == null) {
                elRect = $.extend({}, elRect, {
                    width: elRect.right - elRect.left,
                    height: elRect.bottom - elRect.top
                });
            }
            var elOffset = isBody ? {
                top: 0,
                left: 0
            } : $element.offset();
            var scroll = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() };
            var outerDims = isBody ? {
                width: $(window).width(),
                height: $(window).height()
            } : null;
            return $.extend({}, elRect, scroll, outerDims, elOffset);
        };
        Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
            return placement == 'bottom' ? {
                top: pos.top + pos.height,
                left: pos.left + pos.width / 2 - actualWidth / 2
            } : placement == 'top' ? {
                top: pos.top - actualHeight,
                left: pos.left + pos.width / 2 - actualWidth / 2
            } : placement == 'left' ? {
                top: pos.top + pos.height / 2 - actualHeight / 2,
                left: pos.left - actualWidth
            } : {
                top: pos.top + pos.height / 2 - actualHeight / 2,
                left: pos.left + pos.width
            };
        };
        Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
            var delta = {
                top: 0,
                left: 0
            };
            if (!this.$viewport)
                return delta;
            var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
            var viewportDimensions = this.getPosition(this.$viewport);
            if (/right|left/.test(placement)) {
                var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
                var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
                if (topEdgeOffset < viewportDimensions.top) {
                    delta.top = viewportDimensions.top - topEdgeOffset;
                } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
                    delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
                }
            } else {
                var leftEdgeOffset = pos.left - viewportPadding;
                var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
                if (leftEdgeOffset < viewportDimensions.left) {
                    delta.left = viewportDimensions.left - leftEdgeOffset;
                } else if (rightEdgeOffset > viewportDimensions.width) {
                    delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
                }
            }
            return delta;
        };
        Tooltip.prototype.getTitle = function () {
            var title;
            var $e = this.$element;
            var o = this.options;
            title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);
            return title;
        };
        Tooltip.prototype.getUID = function (prefix) {
            do
                prefix += ~~(Math.random() * 1000000);
            while (document.getElementById(prefix));
            return prefix;
        };
        Tooltip.prototype.tip = function () {
            return this.$tip = this.$tip || $(this.options.template);
        };
        Tooltip.prototype.arrow = function () {
            return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow');
        };
        Tooltip.prototype.enable = function () {
            this.enabled = true;
        };
        Tooltip.prototype.disable = function () {
            this.enabled = false;
        };
        Tooltip.prototype.toggleEnabled = function () {
            this.enabled = !this.enabled;
        };
        Tooltip.prototype.toggle = function (e) {
            var self = this;
            if (e) {
                self = $(e.currentTarget).data('bs.' + this.type);
                if (!self) {
                    self = new this.constructor(e.currentTarget, this.getDelegateOptions());
                    $(e.currentTarget).data('bs.' + this.type, self);
                }
            }
            self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
        };
        Tooltip.prototype.destroy = function () {
            var that = this;
            clearTimeout(this.timeout);
            this.hide(function () {
                that.$element.off('.' + that.type).removeData('bs.' + that.type);
            });
        };
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.tooltip');
                var options = typeof option == 'object' && option;
                if (!data && /destroy|hide/.test(option))
                    return;
                if (!data)
                    $this.data('bs.tooltip', data = new Tooltip(this, options));
                if (typeof option == 'string')
                    data[option]();
            });
        }
        var old = $.fn.tooltip;
        $.fn.tooltip = Plugin;
        $.fn.tooltip.Constructor = Tooltip;
        $.fn.tooltip.noConflict = function () {
            $.fn.tooltip = old;
            return this;
        };
    }(jQuery);
    +function ($) {
        'use strict';
        var Popover = function (element, options) {
            this.init('popover', element, options);
        };
        if (!$.fn.tooltip)
            throw new Error('Popover requires tooltip.js');
        Popover.VERSION = '3.3.4';
        Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
            placement: 'right',
            trigger: 'click',
            content: '',
            template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
        });
        Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);
        Popover.prototype.constructor = Popover;
        Popover.prototype.getDefaults = function () {
            return Popover.DEFAULTS;
        };
        Popover.prototype.setContent = function () {
            var $tip = this.tip();
            var title = this.getTitle();
            var content = this.getContent();
            $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
            $tip.find('.popover-content').children().detach().end()[this.options.html ? typeof content == 'string' ? 'html' : 'append' : 'text'](content);
            $tip.removeClass('fade top bottom left right in');
            if (!$tip.find('.popover-title').html())
                $tip.find('.popover-title').hide();
        };
        Popover.prototype.hasContent = function () {
            return this.getTitle() || this.getContent();
        };
        Popover.prototype.getContent = function () {
            var $e = this.$element;
            var o = this.options;
            return $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content);
        };
        Popover.prototype.arrow = function () {
            return this.$arrow = this.$arrow || this.tip().find('.arrow');
        };
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.popover');
                var options = typeof option == 'object' && option;
                if (!data && /destroy|hide/.test(option))
                    return;
                if (!data)
                    $this.data('bs.popover', data = new Popover(this, options));
                if (typeof option == 'string')
                    data[option]();
            });
        }
        var old = $.fn.popover;
        $.fn.popover = Plugin;
        $.fn.popover.Constructor = Popover;
        $.fn.popover.noConflict = function () {
            $.fn.popover = old;
            return this;
        };
    }(jQuery);
    +function ($) {
        'use strict';
        function ScrollSpy(element, options) {
            this.$body = $(document.body);
            this.$scrollElement = $(element).is(document.body) ? $(window) : $(element);
            this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
            this.selector = (this.options.target || '') + ' .nav li > a';
            this.offsets = [];
            this.targets = [];
            this.activeTarget = null;
            this.scrollHeight = 0;
            this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this));
            this.refresh();
            this.process();
        }
        ScrollSpy.VERSION = '3.3.4';
        ScrollSpy.DEFAULTS = { offset: 10 };
        ScrollSpy.prototype.getScrollHeight = function () {
            return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight);
        };
        ScrollSpy.prototype.refresh = function () {
            var that = this;
            var offsetMethod = 'offset';
            var offsetBase = 0;
            this.offsets = [];
            this.targets = [];
            this.scrollHeight = this.getScrollHeight();
            if (!$.isWindow(this.$scrollElement[0])) {
                offsetMethod = 'position';
                offsetBase = this.$scrollElement.scrollTop();
            }
            this.$body.find(this.selector).map(function () {
                var $el = $(this);
                var href = $el.data('target') || $el.attr('href');
                var $href = /^#./.test(href) && $(href);
                return $href && $href.length && $href.is(':visible') && [[
                        $href[offsetMethod]().top + offsetBase,
                        href
                    ]] || null;
            }).sort(function (a, b) {
                return a[0] - b[0];
            }).each(function () {
                that.offsets.push(this[0]);
                that.targets.push(this[1]);
            });
        };
        ScrollSpy.prototype.process = function () {
            var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
            var scrollHeight = this.getScrollHeight();
            var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height();
            var offsets = this.offsets;
            var targets = this.targets;
            var activeTarget = this.activeTarget;
            var i;
            if (this.scrollHeight != scrollHeight) {
                this.refresh();
            }
            if (scrollTop >= maxScroll) {
                return activeTarget != (i = targets[targets.length - 1]) && this.activate(i);
            }
            if (activeTarget && scrollTop < offsets[0]) {
                this.activeTarget = null;
                return this.clear();
            }
            for (i = offsets.length; i--;) {
                activeTarget != targets[i] && scrollTop >= offsets[i] && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) && this.activate(targets[i]);
            }
        };
        ScrollSpy.prototype.activate = function (target) {
            this.activeTarget = target;
            this.clear();
            var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
            var active = $(selector).parents('li').addClass('active');
            if (active.parent('.dropdown-menu').length) {
                active = active.closest('li.dropdown').addClass('active');
            }
            active.trigger('activate.bs.scrollspy');
        };
        ScrollSpy.prototype.clear = function () {
            $(this.selector).parentsUntil(this.options.target, '.active').removeClass('active');
        };
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.scrollspy');
                var options = typeof option == 'object' && option;
                if (!data)
                    $this.data('bs.scrollspy', data = new ScrollSpy(this, options));
                if (typeof option == 'string')
                    data[option]();
            });
        }
        var old = $.fn.scrollspy;
        $.fn.scrollspy = Plugin;
        $.fn.scrollspy.Constructor = ScrollSpy;
        $.fn.scrollspy.noConflict = function () {
            $.fn.scrollspy = old;
            return this;
        };
        $(window).on('load.bs.scrollspy.data-api', function () {
            $('[data-spy="scroll"]').each(function () {
                var $spy = $(this);
                Plugin.call($spy, $spy.data());
            });
        });
    }(jQuery);
    +function ($) {
        'use strict';
        var Tab = function (element) {
            this.element = $(element);
        };
        Tab.VERSION = '3.3.4';
        Tab.TRANSITION_DURATION = 150;
        Tab.prototype.show = function () {
            var $this = this.element;
            var $ul = $this.closest('ul:not(.dropdown-menu)');
            var selector = $this.data('target');
            if (!selector) {
                selector = $this.attr('href');
                selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
            }
            if ($this.parent('li').hasClass('active'))
                return;
            var $previous = $ul.find('.active:last a');
            var hideEvent = $.Event('hide.bs.tab', { relatedTarget: $this[0] });
            var showEvent = $.Event('show.bs.tab', { relatedTarget: $previous[0] });
            $previous.trigger(hideEvent);
            $this.trigger(showEvent);
            if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented())
                return;
            var $target = $(selector);
            this.activate($this.closest('li'), $ul);
            this.activate($target, $target.parent(), function () {
                $previous.trigger({
                    type: 'hidden.bs.tab',
                    relatedTarget: $this[0]
                });
                $this.trigger({
                    type: 'shown.bs.tab',
                    relatedTarget: $previous[0]
                });
            });
        };
        Tab.prototype.activate = function (element, container, callback) {
            var $active = container.find('> .active');
            var transition = callback && $.support.transition && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);
            function next() {
                $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', false);
                element.addClass('active').find('[data-toggle="tab"]').attr('aria-expanded', true);
                if (transition) {
                    element[0].offsetWidth;
                    element.addClass('in');
                } else {
                    element.removeClass('fade');
                }
                if (element.parent('.dropdown-menu').length) {
                    element.closest('li.dropdown').addClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', true);
                }
                callback && callback();
            }
            $active.length && transition ? $active.one('bsTransitionEnd', next).emulateTransitionEnd(Tab.TRANSITION_DURATION) : next();
            $active.removeClass('in');
        };
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.tab');
                if (!data)
                    $this.data('bs.tab', data = new Tab(this));
                if (typeof option == 'string')
                    data[option]();
            });
        }
        var old = $.fn.tab;
        $.fn.tab = Plugin;
        $.fn.tab.Constructor = Tab;
        $.fn.tab.noConflict = function () {
            $.fn.tab = old;
            return this;
        };
        var clickHandler = function (e) {
            e.preventDefault();
            Plugin.call($(this), 'show');
        };
        $(document).on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler).on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);
    }(jQuery);
    +function ($) {
        'use strict';
        var Affix = function (element, options) {
            this.options = $.extend({}, Affix.DEFAULTS, options);
            this.$target = $(this.options.target).on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this)).on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this));
            this.$element = $(element);
            this.affixed = null;
            this.unpin = null;
            this.pinnedOffset = null;
            this.checkPosition();
        };
        Affix.VERSION = '3.3.4';
        Affix.RESET = 'affix affix-top affix-bottom';
        Affix.DEFAULTS = {
            offset: 0,
            target: window
        };
        Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
            var scrollTop = this.$target.scrollTop();
            var position = this.$element.offset();
            var targetHeight = this.$target.height();
            if (offsetTop != null && this.affixed == 'top')
                return scrollTop < offsetTop ? 'top' : false;
            if (this.affixed == 'bottom') {
                if (offsetTop != null)
                    return scrollTop + this.unpin <= position.top ? false : 'bottom';
                return scrollTop + targetHeight <= scrollHeight - offsetBottom ? false : 'bottom';
            }
            var initializing = this.affixed == null;
            var colliderTop = initializing ? scrollTop : position.top;
            var colliderHeight = initializing ? targetHeight : height;
            if (offsetTop != null && scrollTop <= offsetTop)
                return 'top';
            if (offsetBottom != null && colliderTop + colliderHeight >= scrollHeight - offsetBottom)
                return 'bottom';
            return false;
        };
        Affix.prototype.getPinnedOffset = function () {
            if (this.pinnedOffset)
                return this.pinnedOffset;
            this.$element.removeClass(Affix.RESET).addClass('affix');
            var scrollTop = this.$target.scrollTop();
            var position = this.$element.offset();
            return this.pinnedOffset = position.top - scrollTop;
        };
        Affix.prototype.checkPositionWithEventLoop = function () {
            setTimeout($.proxy(this.checkPosition, this), 1);
        };
        Affix.prototype.checkPosition = function () {
            if (!this.$element.is(':visible'))
                return;
            var height = this.$element.height();
            var offset = this.options.offset;
            var offsetTop = offset.top;
            var offsetBottom = offset.bottom;
            var scrollHeight = $(document.body).height();
            if (typeof offset != 'object')
                offsetBottom = offsetTop = offset;
            if (typeof offsetTop == 'function')
                offsetTop = offset.top(this.$element);
            if (typeof offsetBottom == 'function')
                offsetBottom = offset.bottom(this.$element);
            var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);
            if (this.affixed != affix) {
                if (this.unpin != null)
                    this.$element.css('top', '');
                var affixType = 'affix' + (affix ? '-' + affix : '');
                var e = $.Event(affixType + '.bs.affix');
                this.$element.trigger(e);
                if (e.isDefaultPrevented())
                    return;
                this.affixed = affix;
                this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null;
                this.$element.removeClass(Affix.RESET).addClass(affixType).trigger(affixType.replace('affix', 'affixed') + '.bs.affix');
            }
            if (affix == 'bottom') {
                this.$element.offset({ top: scrollHeight - height - offsetBottom });
            }
        };
        function Plugin(option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('bs.affix');
                var options = typeof option == 'object' && option;
                if (!data)
                    $this.data('bs.affix', data = new Affix(this, options));
                if (typeof option == 'string')
                    data[option]();
            });
        }
        var old = $.fn.affix;
        $.fn.affix = Plugin;
        $.fn.affix.Constructor = Affix;
        $.fn.affix.noConflict = function () {
            $.fn.affix = old;
            return this;
        };
        $(window).on('load', function () {
            $('[data-spy="affix"]').each(function () {
                var $spy = $(this);
                var data = $spy.data();
                data.offset = data.offset || {};
                if (data.offsetBottom != null)
                    data.offset.bottom = data.offsetBottom;
                if (data.offsetTop != null)
                    data.offset.top = data.offsetTop;
                Plugin.call($spy, data);
            });
        });
    }(jQuery);
    return;
});
'use strict';
require.config({
    shim: {
        bootstrap: { deps: ['jquery'] },
        imagesloaded: { deps: ['jquery'] },
        wow: { exports: 'WOW' }
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        requirejs: '../bower_components/requirejs/require',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
        modernizr: '../bower_components/modernizr/modernizr',
        handlebars: '../bower_components/handlebars/handlebars',
        swiper: '../bower_components/swiper/dist/js/swiper',
        outlayer: '../bower_components/outlayer',
        'get-size': '../bower_components/get-size',
        'fizzy-ui-utils': '../bower_components/fizzy-ui-utils',
        eventie: '../bower_components/eventie',
        eventEmitter: '../bower_components/eventEmitter',
        'get-style-property': '../bower_components/get-style-property',
        'doc-ready': '../bower_components/doc-ready',
        'matches-selector': '../bower_components/matches-selector',
        'jquery-bridget': '../bower_components/jquery-bridget/jquery.bridget',
        imagesloaded: '../bower_components/imagesloaded/imagesloaded',
        masonry: '../bower_components/masonry/masonry',
        instatag: './vendor/jquery-instatag/jquery.instatag'
    },
    packages: []
});
require([
    'backbone',
    'views/app',
    'routes/app',
    'bootstrap'
], function (Backbone, AppView, Workspace) {
    new AppView();
    if (history && history.pushState) {
        Backbone.history.start({
            pushState: true,
            root: '/BB-web-demo'
        });
    }
    new Workspace();
});
define('main', [
    'backbone',
    'views/app',
    'routes/app',
    'bootstrap'
], function () {
    return;
});