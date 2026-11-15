import Image from "next/image";
import Link from "next/link";

import "./rollback.css";

type RollbackProps = {
    href: string;
    label: string;
};

export default function Rollback({ href, label }: RollbackProps) {
    return (
        <Link className="rollback-link" href={href} aria-label={label} title={label}>
            <Image src="/icons/rollback.png" alt="" width={36} height={36}/>
        </Link>
    );
}
