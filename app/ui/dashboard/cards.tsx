import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
  info: InformationCircleIcon,
};

export function Card({
  title,
  value,
  type,
  paragraphSize,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
  paragraphSize?: string;
}) {
  const Icon = iconMap[type];
  paragraphSize ? 'text-2xl' : '';
  return (
    <div className="flex flex-col justify-between rounded-xl border bg-gray-950 p-2 text-gray-50 shadow-sm">
      <div className="flex p-2">
        {Icon ? <Icon className="h-5 w-5 text-gray-50" /> : null}
        <p className="text-md ml-2">{title}</p>
      </div>
      <div className="flex h-full flex-row items-center justify-center bg-gray-950">
        <p className="text-md text-centerw truncate rounded-xl">{value}</p>
      </div>
    </div>
  );
}
