'use client';
import { CardDetails, CardPoint } from '@/app/lib/definitions';
import { routeToCardPageById } from '@/app/lib/routing';
import Image from 'next/image';
import { ArrowsUpDownIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { playPositionSlot } from '@/app/lib/rosters';
import { LightLoading } from '../loadingSpinner';

export default function LargeCard({
  position,
  card,
  scoreOne,
  scoreTwo,
  replacements,
  playerId,
  leagueId,
  owner,
}: {
  position: string;
  card: CardDetails | null;
  scoreOne: CardPoint;
  scoreTwo: CardPoint;
  replacements: CardDetails[];
  playerId: number;
  leagueId: number;
  owner: boolean;
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardDetails | null>(card);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const cancel = () => {
    setSelectedCard(card);
    setIsModalVisible(false);
  };

  const saveChange = async () => {
    console.log(
      selectedCard?.card_id,
      card?.card_id,
      selectedCard?.card_id !== card?.card_id,
    );
    if (selectedCard?.card_id && selectedCard.card_id !== card?.card_id) {
      await playPositionSlot(
        selectedCard.card_id,
        playerId,
        position,
        leagueId,
      );
      setIsModalVisible(false);
    }
  };

  const handleCardSelect = (replacement: CardDetails) => {
    setSelectedCard(replacement);
  };

  return (
    <div>
      <div className="h-full w-full">
        <div className="flex justify-center">
          <div className="bg-black px-4 text-white">{position}</div>
        </div>
        <div className="relative flex p-2">
          <div className="w-2/3">
            <p className="relative line-clamp-2 text-ellipsis text-center font-bold underline sm:text-lg">
              {selectedCard ? selectedCard.name : 'empty'}
            </p>
            {card ? (
              <>
                {selectedCard?.card_id === card.card_id ? (
                  <div className="flex flex-col">
                    <div className="m-auto w-32 border border-gray-300">
                      <div className="flex justify-center text-xs">
                        <div>week {scoreOne?.week}</div>
                      </div>
                      <p className="bg-black text-center text-white">
                        {scoreOne?.total_points || 0}
                      </p>
                    </div>
                    <div className="h-2" />
                    <div className="m-auto w-32 border border-gray-300">
                      <div className="flex justify-center text-xs">
                        <div>week {scoreTwo?.week}</div>
                      </div>
                      <p className="bg-black text-center text-white">
                        {scoreTwo?.total_points || 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <LightLoading />
                  </div>
                )}
              </>
            ) : (
              <div />
            )}
          </div>
          <div className="relative w-1/3">
            {card ? (
              <Image
                src={selectedCard?.image[0] || '/card-back.jpg'}
                alt={selectedCard?.name || 'card'}
                width={100}
                height={100}
                className="relative z-40 cursor-pointer hover:opacity-80"
                onClick={() => routeToCardPageById(selectedCard?.card_id || -1)}
              />
            ) : (
              <div className="flex h-full min-h-[50px] w-full items-center justify-center rounded-sm border border-black bg-gray-300">
                ?
              </div>
            )}
          </div>
          {owner && (
            <div className="md:z-5 flex items-center justify-center p-4 transition-opacity md:absolute md:inset-0 md:bg-black md:bg-opacity-50 md:p-0 md:opacity-0 md:hover:opacity-100">
              <ArrowsUpDownIcon
                className="h-12 w-12 cursor-pointer rounded-full bg-red-900 p-2 text-white"
                onClick={showModal}
              />
            </div>
          )}
        </div>
      </div>
      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="m-4 max-h-[80lvh] overflow-scroll rounded bg-gray-50 p-4">
            <h2 className="text-lg font-bold">
              Select a card to swap to your {position} slot
            </h2>
            {/* Add card selection options here */}
            {replacements.map((replacement) => (
              <div
                key={replacement.card_id}
                className={`flex items-center justify-between border p-2 ${
                  replacement.card_id === selectedCard?.card_id
                    ? 'border-red-900'
                    : 'border-gray-300'
                }`}
                onClick={() => handleCardSelect(replacement)}
              >
                <p className="p-1">{replacement.name}</p>
                {replacement.card_id === selectedCard?.card_id && (
                  <div className="rounded-full bg-red-900 p-1 text-white">
                    Selected
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-between">
              <button
                onClick={cancel}
                className="mt-4 rounded border border-black bg-gray-50 p-2 text-black"
              >
                Close
              </button>
              <button
                onClick={saveChange}
                className="mt-4 rounded border border-black bg-black p-2 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
