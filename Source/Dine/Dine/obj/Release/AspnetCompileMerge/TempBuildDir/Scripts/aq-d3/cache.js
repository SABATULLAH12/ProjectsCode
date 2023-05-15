var globleCache = {};
globleCache.CachedData = [];
globleCache.AddObject = function (key, value) {
    if (IsNullOrEmpty(key) === true) { return null; }
    var obj = this.CachedData.filter(function (obj) { return obj.Key === key; });
    if (!IsNullOrEmpty(obj) || !(obj.length <= 0)) { return null; }
    return this.CachedData[this.CachedData.push({ Key: key, Value: value }) - 1].Value;
};
globleCache.IsContainsObject = function (key) {
    if (IsNullOrEmpty(key) || this.CachedData.length <= 0) { return null; }
    var obj = this.CachedData.filter(function (obj) { return obj.Key === key; });
    return IsNullOrEmpty(obj) || obj.length <= 0 ? false : true;
};
globleCache.GetObject = function (key) {
    if (IsNullOrEmpty(key) || this.CachedData.length <= 0) { return null; }
    var obj = this.CachedData.filter(function (obj) { return obj.Key === key; });
    return IsNullOrEmpty(obj) || obj.length <= 0 ? null : obj[0].Value;
};
globleCache.RemoveObject = function (key) {
    if (IsNullOrEmpty(key) || this.CachedData.length <= 0) { return null; }
    var obj = this.CachedData.filter(function (obj) { return obj.Key === key; });
    if (IsNullOrEmpty(obj) || obj.length <= 0) { return; }
    this.CachedData.splice(this.CachedData.indexOf(obj), 1);
    return;
};
var bwLocalStorage = { dataVersionKey: (new Date().toDateString()) };
bwLocalStorage.AddObject = function (key, value) { localStorage.setItem(key + this.dataVersionKey, JSON.stringify(value)); return value; };
bwLocalStorage.IsContainsObject = function (key) { return (!IsNullOrEmpty(key) && localStorage.getItem(key + this.dataVersionKey) != null); };
bwLocalStorage.GetObject = function (key) { if (IsNullOrEmpty(key) || localStorage.getItem(key + this.dataVersionKey) == null) { return null; } return JSON.parse(localStorage.getItem(key + this.dataVersionKey)); };
globleCache.RemoveObject = function (key) {
    if (IsNullOrEmpty(key) || localStorage.getItem(key + dataVersionKey) == null) { return null; }
    var value = localStorage.getItem(key + dataVersionKey);
    localStorage.removeItem(key + dataVersionKey);
    return JSON.parse(value);
};