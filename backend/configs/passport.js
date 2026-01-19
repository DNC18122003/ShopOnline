const passport = require('passport');
// import passport-jwt strategy : middleare for jwt authentication




/*
Mô hình hóa Flow Middleware chuẩn
Hãy hình dung quy trình xử lý 1 request vào API bảo mật (ví dụ: /admin/dashboard) sẽ đi qua 3 cửa ải:

Cửa 1 (Authentication - Passport): Kiểm tra Token/Cookie xem có hợp lệ không? -> Nếu OK, gắn User vào req.user.

Cửa 2 (Business Check - Custom): Kiểm tra req.user.isActive có true không?

Cửa 3 (Authorization - Custom): Kiểm tra req.user.role có phải admin không?

*/