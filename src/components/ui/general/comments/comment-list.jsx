"use client";

import React from "react";
import { objectAge } from "@/utils/objectAge";
import { P } from "@/components/ui/general/primitives";
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function CommentList({ comments = [], language = 'ro', t, onDelete, onEdit, currentUserId, resourceOwnerId }) {
  if (!comments.length) {
    return (
      <div className="bg-stone-100 p-3 rounded-bl-lg rounded-br-lg">
        <div className="text-lg font-bold text-gray-800 mb-2">{t?.('resource.comments.title') || 'Comentarii'}</div>
        <P className="text-gray-600 text-sm">{t?.('resource.comments.empty') || 'Fii primul care lasă un comentariu.'}</P>
      </div>
    );
  }

  return (
    <div className="bg-stone-100 p-3 rounded-bl-lg rounded-br-lg">
      {comments.map((comment) => (
        <div key={comment.id} className="p-4 rounded-lg bg-white border border-gray-300 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800">
                {comment?.author?.name || ''} {comment?.author?.first_name || ''}
              </span>
              <span className="text-gray-500 text-xs ml-2">
                {objectAge(comment, language)}
              </span>
            </div>
            {(currentUserId && (currentUserId === comment.user_id || currentUserId === resourceOwnerId)) ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit?.(comment)}
                  title={t?.('common.edit') || 'Editează'}
                  className="text-blue-700 hover:text-blue-800 cursor-pointer"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete?.(comment)}
                  title={t?.('common.delete') || 'Șterge'}
                  className="text-red-700 hover:text-red-800 cursor-pointer"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>
          <p className="text-gray-700 mt-1 whitespace-pre-wrap break-words">{comment.message}</p>
        </div>
      ))}
    </div>
  );
}
