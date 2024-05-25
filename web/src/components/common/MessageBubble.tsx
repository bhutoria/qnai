import { Messages } from "@/store";
import { useSession } from "next-auth/react";

const MessageBubble = ({ message }: { message: Messages }) => {
  const { data: session } = useSession();

  if (
    session?.user?.name === message.name &&
    session.user.role === message.role
  ) {
    return (
      <div className="flex justify-end">
        <div className="my-2 bg-slate-300/60 tracking-wider px-3 py-1 rounded-lg w-fit max-w-full overflow-clip flex flex-col">
          <span className="text-xs mb-1">{message.name}</span>
          <span
            dangerouslySetInnerHTML={{ __html: linkify(message.message) }}
          ></span>
        </div>
      </div>
    );
  }

  if (message.name === "SYSTEM") {
    return (
      <div className="flex justify-end">
        <div className="my-2 bg-rose-200 text-rose-500 tracking-wider px-3 py-1 rounded-lg w-fit max-w-full overflow-clip flex flex-col">
          <span className="text-xs mb-1">{message.name}</span>
          <span>{message.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div
        className={`my-2 ${
          message.role === "ADMIN" ? "bg-emerald-400/60" : "bg-sky-400/60"
        } tracking-wider px-3 py-1 rounded-lg w-fit max-w-full overflow-clip flex flex-col`}
      >
        <span className="text-xs mb-1">{message.name}</span>
        <span
          dangerouslySetInnerHTML={{ __html: linkify(message.message) }}
        ></span>
      </div>
    </div>
  );
};

const urlRegex =
  /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

function linkify(inputText: string) {
  const replacedText = inputText.replace(urlRegex, function (url) {
    return `<a href="${url}" className="hover:underline" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
  return replacedText;
}

export default MessageBubble;
