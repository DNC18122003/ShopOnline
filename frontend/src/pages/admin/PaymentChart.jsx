import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard } from 'lucide-react';

export default function PaymentChart({ data = [] }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-2 mb-4">
                <CreditCard className="text-green-500" size={20} />
                <h2 className="text-lg font-semibold ">Payment Methods</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#93c5fd" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>

                        <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f9a8d4" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>

                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#86efac" />
                            <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                    </defs>

                    <Pie data={data} dataKey="value" nameKey="method" outerRadius={100} label>
                        {data.map((entry, index) => {
                            let fill = 'url(#blueGradient)';

                            if (entry.method === 'MOMOPAY') fill = 'url(#pinkGradient)';
                            else if (entry.method === 'COD') fill = 'url(#greenGradient)';

                            return <Cell key={index} fill={fill} />;
                        })}
                    </Pie>

                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
