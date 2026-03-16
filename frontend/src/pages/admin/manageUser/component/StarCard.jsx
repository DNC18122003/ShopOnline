import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StarCard = ({ title, value, description, icon }) => {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
};

export default StarCard;
