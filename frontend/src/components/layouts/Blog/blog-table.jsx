import { Eye, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const getStatusColor = (status) => {
  return status === "public"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700"
}

const getStatusLabel = (status) => {
  return status === "public" ? "Công khai" : "Bản nháp"
}

export default function BlogTable({
  posts,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200">
            <TableHead className="font-semibold text-gray-700">
              Tiêu đề
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Người tạo
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Ngày đăng
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Trạng thái
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow
              key={post.id}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-purple-400 rounded-lg flex-shrink-0" />
                  <span className="font-medium text-gray-900">
                    {post.title}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">{post.author}</TableCell>
              <TableCell className="text-gray-600">{post.publishDate}</TableCell>
              <TableCell>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    post.status
                  )}`}
                >
                  {getStatusLabel(post.status)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(post)}
                    className="text-gray-400 hover:text-gray-600 h-8 w-8"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(post)}
                    className="text-gray-400 hover:text-gray-600 h-8 w-8"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(post.id)}
                    className="text-gray-400 hover:text-red-600 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}