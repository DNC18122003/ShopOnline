import * as Dialog from '@radix-ui/react-dialog';

export default function ConfirmDialog({
    open,
    setOpen,
    title = 'Xác nhận',
    message = 'Bạn có chắc muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Huỷ',
    onConfirm,
}) {
    const handleConfirm = () => {
        onConfirm?.();
        setOpen(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40" />

                <Dialog.Content className="fixed top-1/2 left-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6">
                    <Dialog.Title className="text-lg font-semibold mb-2">{title}</Dialog.Title>

                    <Dialog.Description className="text-sm text-gray-600 mb-4">{message}</Dialog.Description>

                    <div className="flex justify-end gap-2">
                        <button onClick={() => setOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100">
                            {cancelText}
                        </button>

                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {confirmText}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
