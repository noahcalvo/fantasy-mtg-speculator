'use client';

import { League, Player } from '@/app/lib/definitions';
import { closeLeague, openLeague } from '@/app/lib/leagues';
import {
  LockOpenIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { use, useState } from 'react';

// used to display league participant count, league name, and open/closed status
export default function LeagueSettings({
  league,
  commissioners,
  adminView = false,
}: {
  league: League;
  commissioners: Player[];
  adminView?: boolean;
}) {
  const [openLeagueModalDisplay, setOpenLeagueModalDisplay] = useState(false);
  const [generateInviteCodeModalDisplay, setGenerateInviteCodeModalDisplay] =
    useState(false);

  const cancel = () => {
    setOpenLeagueModalDisplay(false);
  };

  const saveChange = async () => {
    if (league.open) {
      await closeLeague(league.league_id);
    } else {
      await openLeague(league.league_id);
    }
    setOpenLeagueModalDisplay(false);
  };

  return (
    <div className="mb-4 rounded-xl bg-gray-950 pb-4 pt-4 text-gray-50">
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
        {adminView && (
          <div className="flex flex-col gap-4 px-8 py-4">
            <button
              className="flex items-center justify-center gap-2 rounded-sm border border-gray-50 bg-gray-950 px-3 py-1 text-sm text-gray-50 hover:border-red-900 hover:text-red-900"
              onClick={() => {
                setOpenLeagueModalDisplay(!openLeagueModalDisplay);
              }}
            >
              <LockOpenIcon className="w-5" /> {league.open ? 'Close' : 'Open'}
            </button>
            {!league.open && (
              <button
                className="flex items-center justify-center gap-2 rounded-sm border border-gray-50 bg-gray-950 px-3 py-1 text-sm text-gray-50 hover:border-red-900 hover:text-red-900"
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
          cancel={cancel}
          saveChange={saveChange}
          open={!league.open}
        />
      )}
      {generateInviteCodeModalDisplay && (
        <GenerateInviteCodeModal
          cancel={cancel}
          saveChange={saveChange}
          open={!league.open}
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
    <div className="my-1 flex w-full items-center justify-between px-4">
      <span className="text-sm font-semibold">{settingKey}:</span>
      <span className="text-sm">{settingValue}</span>
    </div>
  );
}

// open is a flag on if the modal is to open or close the league
function OpenCloseLeagueModal({
  cancel,
  saveChange,
  open,
}: {
  cancel: () => void;
  saveChange: () => void;
  open: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 bg-opacity-50">
      <div className="m-2 max-h-[80lvh] overflow-scroll rounded bg-gray-950 p-4">
        <h2 className="my-2 text-md font-semibold">
          Would you like to make this league {open ? 'public' : 'private'}?
        </h2>
        <p className="text-sm">
          {open
            ? 'The league will become visible to anyone joining a league and they will not need permission to join'
            : 'The league will become private and only those invited will be able to join'}
        </p>
        <div className="flex justify-between">
          <button
            onClick={cancel}
            className="mt-4 rounded border border-gray-50 bg-gray-950 p-2 text-gray-50"
          >
            Close
          </button>
          <button
            onClick={saveChange}
            className="mt-4 rounded border border-gray-50 bg-gray-50 p-2 text-gray-950"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

function GenerateInviteCodeModal({
  cancel,
  saveChange,
  open,
}: {
  cancel: () => void;
  saveChange: () => void;
  open: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 bg-opacity-50">
      <div className="m-2 max-h-[80lvh] overflow-scroll rounded bg-gray-950 p-4">
        <h2 className="my-2 text-md font-semibold">
          Create an invite code to share with a new leaguemate
        </h2>
        <p className="text-sm">
          {open
            ? 'The league will become visible to anyone joining a league and they will not need permission to join'
            : 'The league will become private and only those invited will be able to join'}
        </p>
        <div className="flex justify-between">
          <button
            onClick={cancel}
            className="mt-4 rounded border border-gray-50 bg-gray-950 p-2 text-gray-50"
          >
            Close
          </button>
          <button
            onClick={saveChange}
            className="mt-4 rounded border border-gray-50 bg-gray-50 p-2 text-gray-950"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
