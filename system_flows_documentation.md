# Hướng Dẫn Luồng Chạy Hệ Thống Quản Lý Sản Phẩm (ShopOnline)

Tài liệu này mô tả chi tiết luồng thực thi (execution flow) từ Frontend đến Backend của các chức năng chính liên quan đến Sản phẩm, Danh mục và Thương hiệu trong hệ thống.

---

## 1. Product List Page (Trang Danh Sách Sản Phẩm)

**Component & Đường dẫn:**

- **Frontend:** `frontend/src/pages/product/product_listing_page.jsx`
- **Backend API:** `GET /api/products` (ProductController)

**Luồng thực thi:**

1. **Khởi tạo trang (Mount):** Khi người dùng truy cập trang danh sách sản phẩm, React gọi hàm `useEffect` đầu tiên để fetch dữ liệu bộ lọc (Filters).
2. **Fetch Filters:** Frontend gọi 2 API song song: `getCategories({ isActive: true })` và `getBrands({ isActive: true })` để lấy danh sách danh mục và thương hiệu đang kích hoạt, sau đó hiển thị bên thanh Sidebar.
3. **Fetch Products:** Một `useEffect` thứ hai theo dõi các state liên quan đến filter (currentPage, sortBy, selectedCategories, selectedBrands, selectedPriceRange). Nó gọi API `getProducts(params)` gửi các tham số phân trang, sắp xếp và lọc lên backend.
4. **Backend Xử Lý:**
   - Hàm `getProducts` trong `productController.js` nhận các tham số filter từ req.query.
   - Build đối tượng `filter` mongodb: Lọc theo `isActive: true` (nếu không phải là admin báo `showAll`), lọc khoảng giá, lọc mảng mã danh mục (slug) và thương hiệu (slug).
   - Backend fetch dữ liệu sản phẩm cùng với `total` count cho việc phân trang. `populate` các trường `brand` và `category` để đưa về Frontend.
5. **Hiển thị:** Frontend nhận danh sách sản phẩm, cập nhật state `products`, `total`, `totalPages` và hiển thị ra UI thông qua component `ProductCard`. Người dùng có thể phân trang hoặc click vào card để tới trang chi tiết.

---

## 2. Product Detail (Trang Chi Tiết Sản Phẩm)

**Component & Đường dẫn:**

- **Frontend:** `frontend/src/pages/product/product_detail_page.jsx`
- **Backend API:** `GET /api/products/:id` và `GET /api/products/:id/similar` và `GET /api/reviews/product/:id`

**Luồng thực thi:**

1. **Lấy ID từ URL:** Frontend dùng `useParams` để lấy `id` sản phẩm hiện tại.
2. **Khởi tạo dữ liệu:**
   - Khi có `id`, `useEffect` gọi hàm `fetchProduct` (nhờ service `getProductById(id)`).
   - Backend `getProductById` tìm sản phẩm theo `_id` với điều kiện `isActive: true`, populate thông tin `brand` và `category` rồi trả về.
3. **Load dữ liệu liên quan (Cascade Fetching):**
   - Sau khi load được thông tin sản phẩm (`product` state thay đổi), các `useEffect` khác được kích hoạt.
   - Gọi API `getSimilarProducts(productId)` để tìm các sản phẩm cùng danh mục.
   - Gọi API `getReviewByProductId(productId)` để lấy danh sách đánh giá từ người dùng.
4. **Hiển thị UI:** Frontend parse dữ liệu:
   - Các hình ảnh hiển thị trong gallery preview `product.images`.
   - Lọc object `product.specifications.detail_json` để format lại thành mảng cấu hình và hiển thị ở phần Thông số kỹ thuật.
   - Xử lý các button "Thêm vào giỏ hàng" gắn với component `AddToCartButton`.

---

## 3. Manage Category (Quản Lý Danh Mục)

**Component & Đường dẫn:**

- **Frontend:** `frontend/src/pages/Staff/CategoryManagement.jsx`
- **Backend API:** Router `category.route.js` -> `CategoryController`

**Luồng thực thi:**

1. **Khởi tạo bảng:** `CategoryManagement` tải lên, gọi `fetchCategories` với các params về trang hiện tại và `searchTerm`. Backend `getCategories` trả về list danh mục + phân trang.
2. **Thêm mới / Cập nhật Danh mục:**
   - Nhấn "Thêm Danh Mục Mới" hoặc icon "Sửa", modal hiện ra. Modal yêu cầu nhập Tên danh mục, tự động generate chuỗi `slug` thông qua hàm `generateSlug()`.
   - Submit form kích hoạt `createCategory` (POST) hoặc `updateCategory` (PUT).
   - Backend kiểm tra sự tồn tại của `slug` gửi lên, nếu trùng lặp báo lỗi 400. Nếu hợp lệ, lưu DB và trả về 201/200.
   - Frontend Toast thông báo thành công, đóng modal và chạy lại hàm `fetchCategories()`.
3. **Toggle Status & Xóa:**
   - Bật / tắt công tắc trạng thái sẽ gọi API `toggleCategoryStatus` (PATCH). Backend đảo ngược giá trị `isActive` của category đó.
   - Nút xóa (Trash) gọi `deleteCategory` (DELETE) xóa vĩnh viễn (hard delete) document, sau đó tải lại danh sách trên UI.

---

## 4. Manage Brand (Quản Lý Thương Hiệu)

**Component & Đường dẫn:**

- **Frontend:** `frontend/src/pages/Staff/BrandManagement.jsx`
- **Backend API:** Router `brand.route.js` -> `BrandController`

**Luồng thực thi:**
Luồng chạy của **BrandManagement** giống hệt 100% với **CategoryManagement** về logic:

1. **Init:** UI gọi `getBrands()` với phân trang và search keyword.
2. **Modal Form:** Form điền tên thương hiệu, tự động tạo `slug` (không dấu). Submit sẽ tạo POST (`createBrand`) cho hoặc PUT (`updateBrand`). Backend chặn nếu `slug` đã tồn tại trong Entity Brand.
3. **Actions:** Các button Cập nhật trạng thái `toggleBrandStatus` và Xóa `deleteBrand` điều phối trực tiếp vào Controller và update state sau khi fetch lại DB.

---

## 5. Manage Product (Quản Lý Sản Phẩm - Dành cho Staff)

**Component & Đường dẫn:**

- **Frontend:** `frontend/src/pages/Staff/ProductManagement.jsx`
- **Backend API:** `productController.js` và `upload.js`

**Luồng thực thi:**

1. **Khởi tạo dữ liệu Admin:**
   - Component gọi `fetchProducts(showAll: true)` - yêu cầu backend không skip các sản phẩm `isActive: false` (ẩn).
   - Đồng thời chạy `fetchCategoriesAndBrands` để lấy sẵn options nạp vào Dropdown Select cho tính năng Edit.
2. **Tính năng Bật/Tắt (Toggle) & Xóa:** Gọi trực tiếp PUT (`updateProduct` với 1 field `isActive`) hoặc DELETE (`deleteProduct`).
3. **Sửa sản phẩm (Edit):**
   - Nút "Sửa" gán dữ liệu dòng hiện hành vào Form State và Array Images (`existingImages`).
   - User có thể xóa cũ, thêm ảnh mới.
   - **Lưu ý Ảnh:** Khi submit, nếu có file ảnh mới (`newImageFiles`), frontend gửi `FormData` gọi API upload ảnh (Cloudinary hoặc Local). Sau khi backend trả mảng URL ảnh, các link này nối (merge) cùng link cũ sẽ được đóng gói truyền json vào PUT `updateProduct` cùng với thông tin tên, giá, số lượng.
   - Backend kiểm tra điều kiện category/brand phải tồn tại, đẩy bản lưu giá cũ vào `price_history` (nếu giá thay đổi) và Update bản ghi.

---

## 6. Create Product (Tạo Sản Phẩm Mới)

**Component & Đường dẫn:**

- **Frontend:** `frontend/src/pages/Staff/CreateProduct.jsx`
- **Backend API:** `POST /api/products` (ProductController)

**Luồng thực thi:**
Đây là luồng nghiệp vụ phức tạp nhất gồm nhiều bước tại Frontend trước khi submit:

1. **Chuẩn bị dữ liệu:** Chạy `useEffect` fetch dữ liệu danh mục và thương hiệu để fill vào `<select>`.
2. **Thu thập dữ liệu theo block:**
   - _Basic Info:_ Tên sản phẩm, Mô tả.
   - _Price/Stock:_ Thu nhận `<input type="number">`.
   - _Phân loại:_ Dropdown Categories & Brands (gắn ID).
   - _Ảnh:_ Cho phép upload <= 5 File. Xem preview dùng `FileReader` tại máy khách.
   - _Specifications (Cứng):_ Map Object tĩnh `{socket, ram_type, form_factor...}`.
   - _Specifications JSON (Động):_ Mảng động Key-Value (`detailSpecs`) sinh ra thẻ Input động cho người nhập (Ví dụ Key:"Chip GPU" / Value:"NVIDIA").
3. **Submit luồng Backend:**
   - **Kiểm duyệt Input:** Validate các field Name, Price > 0, Stock > 0, bắt buộc có Brand, Category.
   - **Upload Ảnh trước:** Bọc mảng ảnh vào `FormData` gọi API `uploadImages(uploadFormData)`. Backend tải ảnh lên máy chủ và trả mảng URl.
   - **Gom Specs:** Build lại các object `specifications` lọc bỏ trường rỗng, format số (với wattage, capacity), tạo json `detail_json` từ mảng động `detailSpecs`.
   - **Gọi POST Create Product:** Ghép các biến (kèm Image URLs) thành một payload chuẩn JSON và gọi.
   - Tại Backend: `createProduct` kiểm định sự tồn tại Database của mảng Category/Brand -> Lưu Entity cấu trúc Product Schema, đồng thời snapshot giá vừa tạo đẩy vào biến mảng `price_history`.
   - Cuối cùng: Frontend nhận Response 201 Success, hiển thị `toast.success` và reset/chuyển trang.
