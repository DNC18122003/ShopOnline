import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Camera, Video, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { getReviewsByProduct, createReview } from '../../services/order/review.api';
import { getOrderDetail } from '../../services/order/order.api';
import { toast } from 'react-toastify';
const STARS = [5, 4, 3, 2, 1];

export default function RatingPage() {
    const [ratings, setRatings] = useState([]); // danh sách review
    const [rating, setRating] = useState(0); //số sao user chọn
    const { id: orderId } = useParams();
    const [comment, setComment] = useState('');
    const [filterStar, setFilterStar] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [order, setOrder] = useState(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [product, setProduct] = useState(null);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const fetchReviews = async () => {
        try {
            setLoading(true);

            const data = await getReviewsByProduct(product.productId);

            setRatings(data);

            // kiểm tra user đã review chưa
            const myReview = data.find((r) => r.orderId === orderId);

            if (myReview) {
                setHasReviewed(true);
            }
        } catch (error) {
            console.error('Lỗi load review:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderData = await getOrderDetail(orderId);

                console.log('Order response:', orderData);

                setOrder(orderData);

                const item = orderData.items?.[0];
                setProduct(item);
            } catch (err) {
                console.error('Lỗi load order:', err);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (product) {
            fetchReviews();
        }
    }, [product]);

    useEffect(() => {
        return () => {
            images.forEach((img) => URL.revokeObjectURL(img.preview));
            videos.forEach((vid) => URL.revokeObjectURL(vid.preview));
        };
    }, [images, videos]);

  const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);

      if (images.length + files.length > 5) {
          toast.error('Chỉ được upload tối đa 5 ảnh');
          return;
      }
      if (files.size > 5 * 1024 * 1024) {
          toast.error('Ảnh tối đa 5MB');
          return;
      }

      const newImages = files.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
      }));

      setImages((prev) => [...prev, ...newImages]);
  };
   const handleVideoUpload = (e) => {
       const file = e.target.files[0];

       if (!file) return;

       if (videos.length >= 1) {
           toast.error('Chỉ được upload tối đa 1 video');
           return;
       }
       if (file.size > 20 * 1024 * 1024) {
           toast.error('Video tối đa 20MB');
           return;
       }

       setVideos([
           {
               file,
               preview: URL.createObjectURL(file),
           },
       ]);
   };
   const removeImage = (index) => {
       setImages((prev) => prev.filter((_, i) => i !== index));
   };
   const removeVideo = () => {
       setVideos([]);
   };

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (!product) {
          toast.error('Không tìm thấy sản phẩm để đánh giá');
          return;
      }

      if (!rating) {
          toast.error('Vui lòng chọn số sao');
          return;
      }

      if (!comment.trim()) {
          toast.error('Vui lòng nhập nội dung đánh giá');
          return;
      }

      try {
          const formData = new FormData();

          formData.append('productId', product.productId);
          formData.append('orderId', orderId);
          formData.append('rating', rating);
          formData.append('comment', comment);

        images.forEach((img) => {
            formData.append('media', img.file);
        });

        videos.forEach((vid) => {
            formData.append('media', vid.file);
        });
        
          await createReview(formData);

          toast.success('Đánh giá thành công');

          setRating(0);
          setComment('');
          setImages([]);
          setVideos([]);

          fetchReviews();
      } catch (error) {
          console.error('Lỗi tạo review:', error);

          toast.error(error.response?.data?.message || 'Không thể tạo đánh giá');
      }
  };

    const average =
        ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : 0;

    const total = ratings.length;

    const starCounts = {
        5: ratings.filter((r) => r.rating === 5).length,
        4: ratings.filter((r) => r.rating === 4).length,
        3: ratings.filter((r) => r.rating === 3).length,
        2: ratings.filter((r) => r.rating === 2).length,
        1: ratings.filter((r) => r.rating === 1).length,
    };

    const filteredRatings = filterStar ? ratings.filter((r) => r.rating === filterStar) : ratings;

    return (
        <div className="mt-12 p-10 max-w-6xl mx-auto">
            {/* Title */}
            <h1 className="text-center text-4xl font-bold mb-10">Đánh giá sản phẩm</h1>
            {product && (
                <div className="bg-white shadow rounded-xl p-4 mb-6 flex gap-4 items-center">
                    <img src={product.imageSnapshot} className="w-20 h-20 object-cover rounded" />

                    <div>
                        <p className="font-semibold">{product.nameSnapshot}</p>

                        <p className="text-sm text-gray-500">{product.priceSnapshot?.toLocaleString('vi-VN')}đ</p>
                    </div>
                </div>
            )}
            {/* RATING SUMMARY */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-10">
                <div className="flex flex-col lg:flex-row gap-10 items-center">
                    <div className="text-center">
                        <div className="text-6xl font-bold">{average}</div>

                        <div className="flex justify-center gap-1 my-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={24}
                                    className={
                                        i <= Math.round(average) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                                    }
                                />
                            ))}
                        </div>

                        <p className="text-gray-600">{total} lượt đánh giá</p>
                    </div>

                    {/* STAR BARS */}
                    <div className="flex-1 space-y-3">
                        {STARS.map((star) => {
                            const count = starCounts[star];
                            const percent = total ? (count / total) * 100 : 0;

                            return (
                                <div key={star} className="flex items-center gap-4">
                                    <span className="w-10">{star} sao</span>

                                    <div className="flex-1 h-4 bg-gray-200 rounded-full">
                                        <div
                                            className="h-full bg-yellow-500 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>

                                    <span className="w-10 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FILTER */}
            <div className="flex flex-wrap gap-3 mb-10">
                <button
                    onClick={() => setFilterStar(null)}
                    className={`px-5 py-2 rounded-full ${
                        filterStar === null ? 'bg-green-600 text-white' : 'bg-gray-200'
                    }`}
                >
                    Tất cả
                </button>

                {STARS.map((star) => (
                    <button
                        key={star}
                        onClick={() => setFilterStar(star)}
                        className={`px-5 py-2 rounded-full flex items-center gap-2 ${
                            filterStar === star ? 'bg-green-600 text-white' : 'bg-gray-200'
                        }`}
                    >
                        {star}
                        <Star size={16} />
                    </button>
                ))}
            </div>

            {/* REVIEW FORM */}
            {!hasReviewed && (
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8 mb-10">
                    <h3 className="text-2xl font-bold text-center mb-8">Viết đánh giá</h3>

                    {/* STARS */}

                    <div className="flex justify-center gap-5 mb-6">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} type="button" onClick={() => setRating(s)}>
                                <Star
                                    size={40}
                                    className={s <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                                />
                            </button>
                        ))}
                    </div>

                    {/* COMMENT */}

                    <textarea
                        rows={5}
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border p-4 rounded-xl"
                    />

                    {/* MEDIA */}

                    <div className="mt-6 flex gap-4">
                        <label className="border-dashed border-2 p-4 rounded-lg cursor-pointer">
                            <Camera />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>

                        <label className="border-dashed border-2 p-4 rounded-lg cursor-pointer">
                            <Video />
                            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                        </label>
                    </div>
                    <div className="flex gap-4 mt-4 flex-wrap">
                        {images.map((img, index) => (
                            <div key={index} className="relative">
                                <img src={img.preview} className="w-24 h-24 object-cover rounded-lg" />

                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded"
                                >
                                    X
                                </button>
                            </div>
                        ))}

                        {videos.map((vid, index) => (
                            <div key={index} className="relative">
                                <video src={vid.preview} className="w-24 h-24 object-cover rounded-lg" controls />

                                <button
                                    type="button"
                                    onClick={removeVideo}
                                    className="absolute top-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* BUTTON */}

                    <div className="flex justify-end mt-6">
                        <button
                            disabled={loading}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl disabled:opacity-50"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </div>
                </form>
            )}

            {/* REVIEW LIST */}

            <div className="space-y-6">
                {filteredRatings.length === 0 ? (
                    <p className="text-center text-gray-500">Chưa có đánh giá</p>
                ) : (
                    filteredRatings.map((r) => (
                        <div key={r._id} className="bg-white p-6 rounded-2xl shadow-md">
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-semibold">{r.userId?.name}</p>

                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={
                                                    i <= r.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button>
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <p className="mt-4 text-gray-700">{r.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {/* IMAGE PREVIEW */}

            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 bg-black/80 flex items-center justify-center"
                >
                    <img
                        src={img.preview}
                        onClick={() => setPreviewImage(img.preview)}
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                    />
                </div>
            )}
        </div>
    );
}
