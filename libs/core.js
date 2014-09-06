/**
 * Created by Administrator on 13-11-29.
 */
/*
 * @val1 is array first params
 * @val2 is array second params
 */
exports.ARRAY_ASC = function(val1,val2)
{
    return val1>val2?1:val1<val2?-1:0;
}

exports.ARRAY_DESC = function(val1,val2)
{
    return val1>val2?-1:val1<val2?1:0;
}

var arr = [10,4,9,6,2];
console.log(arr.sort(exports.ARRAY_ASC));