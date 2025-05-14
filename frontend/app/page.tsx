"use client";
import React from "react";
import { useState, useEffect, useCallback } from "react";

interface Note {
  _id: string;
  content: string;
  createdAt?: string;
}

type ApiError = {
  error: string;
  details?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URI || "http://127.0.0.1:5000/api";

export default function HomePage(): React.ReactElement {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/notes`);
      if (!response.ok) {
        let errorData: ApiError | null = null;
        try {
          errorData = (await response.json()) as ApiError;
        } catch (jsonError) {
          console.error("Response was not JSON: ", jsonError);
        }
        throw new Error(
          errorData?.error ||
            `HTTP error! status: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json() as Note[];
      setNotes(data);
    } catch (e: unknown) {
      console.error("Failed to fetch notes: ", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred while fetching notes.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!newNoteContent.trim()) {
      setError("Note content cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newNoteContent }),
      });
      if (!response.ok) {
        let errorData: ApiError | null = null;
        try {
          errorData = (await response.json()) as ApiError;
        } catch (jsonError) {
          console.error("Response was not json: ", jsonError);
        }
        throw new Error(
          errorData?.error ||
            `HTTP error! status: ${response.status} ${response.statusText}`
        );
      }
      //const createdNote = await response.json() as Note;
      fetchNotes()
      setNewNoteContent("")
    } catch (e: unknown) {
      console.error("Failed to create note: ", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred while creating the note.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async (_id: string) => {
    await fetch(API_URL+`/notes/${_id}`, {method: 'DELETE'})
    fetchNotes()
  }

  return (
    <div className="container mx-auto p-4 font-sans lg:px-[20%]">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">Notes App</h1>
        <p className="text-gray-600">
          Next.js Fronted | Flask Backend | MongoDB
        </p>
      </header>
      <form
        onSubmit={handleSubmit}
        className="mb-8 p-6 bg-white shadow-lg rounded-lg"
      >
        <textarea 
        value={newNoteContent}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value) } 
        placeholder="Enter your note here..."
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out text-black"
        rows={4}
        disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-blue-50 focus:ring-opacity-50 disabled:bg-gray-400 transition duration-150 ease-in-out"
        >
        {isLoading? 'Adding...':'Add Note'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          <strong>Error: </strong>{error}
          </div>
      )}

      <section className="bg-white shadow-lg rouned-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Your Notes</h2>
        {isLoading && notes.length === 0 && <p className="text-gray-500">Loading notes...</p>}
        {!isLoading && notes.length === 0 && !error && (
          <p className="text-gray-500">No notes yet. Add one above!</p>
        )}
        {notes.length > 0 && (
          <ul className="space-y-4">
            {notes.slice().reverse().map((note: Note) => (
              <li key={note._id} className="p-4 px-2 border border-gray-200 rounded-md bg-gray-50 hover:shadow-md transition-shadow duration-150 ease-in-out flex">
                <p className="w-5/6 whitespace-pre-wrap text-gray-800">{note.content}</p>
                <button onClick={() => handleDelete(note._id)} className="w-1/6 h-10 w-20 p-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-blue-50 focus:ring-opacity-50 transition duration-150 ease-in-out">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="text-center mt-12 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">&copy: {new Date().getFullYear()} John Nti Anokye</p>
      </footer>
    </div>
  );
}
