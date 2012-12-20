var locale = require('..');

var w = console.log;

var __ = locale.__;

locale.init('i18n');
locale.to('ru');

w(__());

var some_space = 123;

w(__("Hello!# This is comment"));

w(__("Hello!# This is another comment"));

w(__("Hello!#testid This is comment with id"))

w(__("Hello!#id_without_comment"))

w(__("This is## not comment."))

//__("Bye-bye!")

some_space += 321; // __('Ignored')

var more;

/* Code below will be ignored

__('Ignored again');

*/

w(__('Goodbye...'));

w(__('In phrase \' or ) or __(')); var a = ');'

var wow = '__('; var s = 'Bad string )';

w(__(['%n byte', '%n bytes'], 4));

w(__(['%n error', '%n errors'], 4));

w(__("Long text.\nMultiple lines.\nMore and more."))
