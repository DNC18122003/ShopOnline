import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Clock, CheckCircle, Truck, Package, XCircle, RotateCcw, ChevronDown } from 'lucide-react';

const orderStatusConfig = {
    pending: {
        label: 'Chờ xử lý',
        icon: Clock,
        color: 'text-yellow-600',
    },

    confirmed: {
        label: 'Đã xác nhận',
        icon: CheckCircle,
        color: 'text-blue-600',
    },

    shipping: {
        label: 'Đang giao',
        icon: Truck,
        color: 'text-indigo-600',
    },

    delivered: {
        label: 'Đã giao',
        icon: Package,
        color: 'text-purple-600',
    },

    completed: {
        label: 'Hoàn tất',
        icon: CheckCircle,
        color: 'text-green-600',
    },

    cancelled: {
        label: 'Đã huỷ',
        icon: XCircle,
        color: 'text-red-600',
    },

    returned: {
        label: 'Trả hàng',
        icon: RotateCcw,
        color: 'text-gray-600',
    },

    delivery_failed: {
        label: 'Giao thất bại',
        icon: XCircle,
        color: 'text-red-500',
    },
};

const StatusDropdown = ({ order, statusFlow, onChange }) => {
    const currentStatus = order.orderStatus;
    const nextStatuses = statusFlow[currentStatus] || [];

    const currentConfig = orderStatusConfig[currentStatus];
    const CurrentIcon = currentConfig.icon;

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 px-2 py-1 border rounded hover:bg-gray-100">
                    <CurrentIcon size={16} className={currentConfig.color} />
                    <ChevronDown size={14} />
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content sideOffset={5} className="z-50 bg-white border rounded shadow-md p-1">
                    {nextStatuses.map((status) => {
                        const config = orderStatusConfig[status];
                        const Icon = config.icon;

                        return (
                            <DropdownMenu.Item
                                key={status}
                                onSelect={(e) => {
                                    e.preventDefault();
                                    onChange(order._id, status);
                                }}
                                className="p-2 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
                            >
                                <Tooltip.Provider>
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <span className={config.color}>
                                                <Icon size={18} />
                                            </span>
                                        </Tooltip.Trigger>

                                        <Tooltip.Portal>
                                            <Tooltip.Content
                                                side="right"
                                                sideOffset={6}
                                                className="bg-blue-500 text-white text-xs px-2 py-1 rounded z-[9999] whitespace-nowrap shadow-lg"
                                            >
                                                {config.label}
                                                <Tooltip.Arrow className="fill-blue-500" />
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </Tooltip.Provider>
                            </DropdownMenu.Item>
                        );
                    })}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default StatusDropdown;
