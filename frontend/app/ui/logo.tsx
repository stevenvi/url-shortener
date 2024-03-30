import { LinkIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function Logo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <p className="text-[28px]">URL Shortener</p>
      <LinkIcon className="h-12 w-12 rotate-[-45deg]" />
    </div>
  );
}
