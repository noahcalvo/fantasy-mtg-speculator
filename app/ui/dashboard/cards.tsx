import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  return (
    <>
      {/* NOTE: comment in this code when you get to this point in the course */}

      {/* <Card title="Collected" value={totalPaidInvoices} type="collected" />
      <Card title="Pending" value={totalPendingInvoices} type="pending" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card
        title="Total Customers"
        value={numberOfCustomers}
        type="customers"
      /> */}
    </>
  );
}

export function Card({
  title,
  value,
  type,
  paragraphSize,
  headerSize
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
  paragraphSize?: string;
  headerSize?: string;
}) {
  const Icon = iconMap[type];
  paragraphSize ? 'text-2xl' : ''
  headerSize ? 'text-3xl' : ''
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm flex flex-col justify-between">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 font-medium"
        style={{ fontSize: headerSize}}
        >
          {title}
        </h3>
      </div>
      <p
        className="truncate rounded-xl bg-white px-4 py-8 text-center"
        style={{ fontSize: paragraphSize }}
      >
        {value}
      </p>
    </div>
  );
}
