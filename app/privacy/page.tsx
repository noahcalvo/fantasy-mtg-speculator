import BackButton from '../dashboard/cards/components/back-button';

export default function Page() {
  return (
    <div className="p-6 text-green-50">
      <BackButton />
      <br />
      <div className="flex justify-center">
        <p>
          Don&apos;t use a password you use for important things. I&apos;m not
          going to promise anything.
        </p>
      </div>
    </div>
  );
}
