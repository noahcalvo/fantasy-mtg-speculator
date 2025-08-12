'use client';

import { League, Player } from '@/app/lib/definitions';
import { closeLeague, openLeague, createInviteCode } from '@/app/lib/leagues';
import {
  LockOpenIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import { Copy } from 'lucide-react';

// used to display league participant count, league name, and open/closed status
export default function LeagueSettings({
  league,
  commissioners,
  isCommissioner = false,
}: {
  league: League;
  commissioners: Player[];
  isCommissioner?: boolean;
}) {
  const [openLeagueModalDisplay, setOpenLeagueModalDisplay] = useState(false);
  const [generateInviteCodeModalDisplay, setGenerateInviteCodeModalDisplay] =
    useState(false);
  const [generatedInviteCode, setGeneratedInviteCode] = useState<string | null>(
    null,
  );

  const cancel = () => {
    setOpenLeagueModalDisplay(false);
    setGenerateInviteCodeModalDisplay(false);
  };

  const saveChange = async () => {
    if (league.open) {
      await closeLeague(league.league_id);
    } else {
      await openLeague(league.league_id);
    }
    setOpenLeagueModalDisplay(false);
  };

  const generateCode = async () => {
    const code = await createInviteCode(league.league_id);
    setGenerateInviteCodeModalDisplay(false);
    setGeneratedInviteCode(code);
  };

  return (
    <div className="mb-4 rounded-xl bg-gray-950 p-4 text-gray-50">
      <h2 className="mx-2 mb-4 text-center text-md">General</h2>
      <div className="flex flex-col items-start justify-center">
        <SettingDisplayName settingKey="Name" settingValue={league.name} />

        <SettingDisplayName
          settingKey="Members"
          settingValue={league.participants.length}
        />
        <SettingDisplayName
          settingKey="Open to Public"
          settingValue={league.open ? 'Yes' : 'No'}
        />
        {isCommissioner && (
          <div className="flex gap-4 px-8 py-4">
            <button
              className="flex items-center justify-center gap-2 rounded-sm border border-gray-50 bg-gray-950 px-3 py-1 text-sm text-gray-50 hover:bg-red-900"
              onClick={() => {
                setOpenLeagueModalDisplay(!openLeagueModalDisplay);
              }}
            >
              <LockOpenIcon className="w-5" /> {league.open ? 'Close' : 'Open'}
            </button>
            {!league.open && (
              <button
                className="flex items-center justify-center gap-2 rounded-sm border border-gray-50 bg-gray-950 px-3 py-1 text-sm text-gray-50 hover:bg-red-900"
                onClick={() => {
                  setGenerateInviteCodeModalDisplay(
                    !generateInviteCodeModalDisplay,
                  );
                }}
              >
                <ArrowRightStartOnRectangleIcon className="w-5" /> Generate
                Invite Code
              </button>
            )}
          </div>
        )}
        <SettingDisplayName
          settingKey="Commissioners"
          settingValue={commissioners
            .map((commissioner) => commissioner.name)
            .join(', ')}
        />
      </div>
      {openLeagueModalDisplay && (
        <OpenCloseLeagueModal
          close={cancel}
          saveChange={saveChange}
          open={!league.open}
        />
      )}
      {generateInviteCodeModalDisplay && (
        <GenerateInviteCodeModal close={cancel} generateCode={generateCode} />
      )}
      {generatedInviteCode && (
        <DisplayInviteCode
          code={generatedInviteCode}
          close={() => setGeneratedInviteCode(null)}
        />
      )}
    </div>
  );
}

function SettingDisplayName({
  settingKey,
  settingValue,
}: {
  settingKey: string;
  settingValue: string | number;
}) {
  return (
    <div className="my-1 flex w-full items-center justify-between">
      <span className="text-sm font-semibold">{settingKey}:</span>
      <span className="text-sm">{settingValue}</span>
    </div>
  );
}

// open is a flag on if the modal is to open or close the league
function OpenCloseLeagueModal({
  close,
  saveChange,
  open,
}: {
  close: () => void;
  saveChange: () => void;
  open: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/50">
      <div className="m-2 max-h-[80lvh] overflow-scroll rounded bg-gray-950 p-4">
        <button
          onClick={close}
          aria-label="Close modal"
          className="static right-2 top-2 flex h-4 w-4 items-center justify-center rounded bg-white text-md leading-none text-black focus:outline-none"
        >
          ×
        </button>

        <h2 className="my-2 text-md font-semibold">
          Would you like to make this league {open ? 'public' : 'private'}?
        </h2>
        <p className="text-sm">
          {open
            ? 'The league will become visible to anyone joining a league and they will not need permission to join'
            : 'The league will become private and only those invited will be able to join'}
        </p>
        <button
          onClick={saveChange}
          className="float-right mt-4 rounded border border-gray-50 bg-gray-50 p-2 text-gray-950"
        >
          Yes
        </button>
      </div>
    </div>
  );
}

function GenerateInviteCodeModal({
  close,
  generateCode,
}: {
  close: () => void;
  generateCode: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/50">
      <div className="m-2 max-h-[80lvh] overflow-scroll rounded bg-gray-950 p-4">
        <button
          onClick={close}
          aria-label="Close modal"
          className="static right-2 top-2 flex h-4 w-4 items-center justify-center rounded bg-white text-md leading-none text-black focus:outline-none"
        >
          ×
        </button>

        <h2 className="my-2 text-md font-semibold">
          Generate a code to invite a new leaguemate
        </h2>
        <p className="text-sm">
          The code will expire after 24 hours and can only be used once.
        </p>
        <button
          onClick={generateCode}
          className="float-right mt-4 rounded border border-gray-50 bg-gray-50 p-2 text-gray-950"
        >
          Generate
        </button>
      </div>
    </div>
  );
}

function DisplayInviteCode({
  code,
  close,
}: {
  code: string;
  close: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/50">
      <div className="m-2 max-h-[80lvh] w-60 overflow-scroll rounded bg-gray-950 p-4">
        <button
          onClick={close}
          aria-label="Close modal"
          className="static right-2 top-2 flex h-4 w-4 items-center justify-center rounded bg-white text-md leading-none text-black focus:outline-none"
        >
          ×
        </button>

        <div className="flex w-full items-center justify-center space-x-2">
          <h2>{code}</h2>
          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className="rounded p-1 hover:bg-gray-500"
          >
            <Copy size={16} />
          </button>
        </div>
        {/* Inline status message below */}
        <div className="mt-2 h-[2rem] overflow-hidden text-sm text-green-600">
          {copied ? 'Copied!' : 'Make sure you copy the code before closing.'}
        </div>
      </div>
    </div>
  );
}
