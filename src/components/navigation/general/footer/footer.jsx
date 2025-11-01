/**
 * Footer — site footer with four columns of links and legal section.
 */
import Link from "next/link";
import { useLanguage } from "@/context/language-context";

export default function Footer() {
	const { t } = useLanguage();
	return (
		<footer className="border-t border-gray-800 bg-gray-900 text-white">
			<div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-10 md:py-12">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
					<div>
						<h4 className="text-sm font-semibold tracking-wide text-white">{t('footer.brand')}</h4>
						<p className="mt-3 text-sm leading-6 text-gray-300 max-w-prose">
							{t('footer.brandDesc')}
						</p>
					</div>

					<div>
						<h4 className="text-sm font-semibold tracking-wide text-white">{t('footer.product')}</h4>
						<ul className="mt-3 space-y-2 text-sm">
							<li>
								<Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.features')}</Link>
							</li>
							<li>
								<Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.pricing')}</Link>
							</li>
							<li>
								<Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.whatsNew')}</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-sm font-semibold tracking-wide text-white">{t('footer.company')}</h4>
						<ul className="mt-3 space-y-2 text-sm">
							<li>
								<Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.about')}</Link>
							</li>
							<li>
								<Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.careers')}</Link>
							</li>
							<li>
								<Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.contact')}</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-sm font-semibold tracking-wide text-white">{t('footer.resources')}</h4>
						<ul className="mt-3 space-y-2 text-sm">
							<li>
								<Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.docs')}</Link>
							</li>
							<li>
								<Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.guides')}</Link>
							</li>
							<li>
								<Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.support')}</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-10 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
					<p className="order-2 md:order-1">{t('footer.copy')}</p>
					<ul className="order-1 md:order-2 flex items-center gap-4">
						<li><Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.terms')}</Link></li>
						<li><Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.privacy')}</Link></li>
						<li><Link className="text-gray-300 px-2 py-1 rounded hover:text-blue-400 inline-block" href="#">{t('footer.cookies')}</Link></li>
					</ul>
				</div>
			</div>
		</footer>
	);
}

