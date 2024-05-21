import { debounce } from "@solid-primitives/scheduled";
import {
	type Accessor,
	type Resource,
	Show,
	createEffect,
	createMemo,
	createSignal,
} from "solid-js";
import { embedHeight } from "../../../config/types";
import {
	type JsonAuthUser,
	type JsonPerfQuery,
	type JsonProject,
	Visibility,
} from "../../../types/bencher";
import { apiUrl } from "../../../util/http";
import { setPageTitle } from "../../../util/resource";
import Field from "../../field/Field";
import FieldKind from "../../field/kind";
import { DEBOUNCE_DELAY } from "../../../util/valid";
import { useSearchParams } from "../../../util/url";
import {
	EMBED_TITLE_PARAM,
	PERF_PLOT_EMBED_PARAMS,
	PERF_PLOT_PARAMS,
} from "./PerfPanel";

export interface Props {
	apiUrl: string;
	isConsole: boolean;
	user: JsonAuthUser;
	project: Resource<JsonProject>;
	isPlotInit: Accessor<boolean>;
	perfQuery: Accessor<JsonPerfQuery>;
	handleRefresh: () => void;
}

const PerfHeader = (props: Props) => {
	const [share, setShare] = createSignal(false);

	createEffect(() => {
		setPageTitle(props.project()?.name);
	});

	return (
		<div class="columns">
			<div class="column">
				<h1 class="title is-3" style="word-break: break-word;">
					{props.project()?.name}
				</h1>
			</div>
			<ShareModal
				apiUrl={props.apiUrl}
				user={props.user}
				perfQuery={props.perfQuery}
				isPlotInit={props.isPlotInit}
				project={props.project}
				share={share}
				setShare={setShare}
			/>
			<div class="column is-narrow">
				<nav class="level">
					<div class="level-right">
						<Show when={props.project()?.url}>
							<div class="level-item">
								<a
									class="button is-fullwidth"
									title={`View ${props.project()?.name} website`}
									href={props.project()?.url ?? ""}
									rel="noreferrer nofollow"
									target="_blank"
								>
									<span class="icon">
										<i class="fas fa-globe" />
									</span>
									<span>Website</span>
								</a>
							</div>
						</Show>
						<Show when={!props.isPlotInit()}>
							<nav class="level is-mobile">
								<Show when={props.project()?.visibility === Visibility.Public}>
									<div class="level-item">
										<button
											class="button is-fullwidth"
											type="button"
											title={`Share ${props.project()?.name}`}
											onClick={(e) => {
												e.preventDefault();
												setShare(true);
											}}
										>
											<span class="icon">
												<i class="fas fa-share" />
											</span>
											<span>Share</span>
										</button>
									</div>
								</Show>

								<div class="level-item">
									<button
										class="button is-fullwidth"
										type="button"
										title="Refresh Query"
										onClick={(e) => {
											e.preventDefault();
											props.handleRefresh();
										}}
									>
										<span class="icon">
											<i class="fas fa-sync-alt" />
										</span>
										<span>Refresh</span>
									</button>
								</div>
							</nav>
						</Show>
					</div>
				</nav>
			</div>
		</div>
	);
};

export default PerfHeader;

export interface ShareProps {
	apiUrl: string;
	user: JsonAuthUser;
	perfQuery: Accessor<JsonPerfQuery>;
	isPlotInit: Accessor<boolean>;
	project: Accessor<undefined | JsonProject>;
	share: Accessor<boolean>;
	setShare: (share: boolean) => void;
}

const ShareModal = (props: ShareProps) => {
	const location = window.location;
	const [searchParams, _setSearchParams] = useSearchParams();

	const [title, setTitle] = createSignal(null);

	const handle_title = debounce(
		(_key, value, _valid) => setTitle(value),
		DEBOUNCE_DELAY,
	);

	const perfPlotParams = createMemo(() => {
		const newParams = new URLSearchParams();
		for (const [key, value] of Object.entries(searchParams)) {
			if (value && PERF_PLOT_PARAMS.includes(key)) {
				newParams.set(key, value);
			}
		}
		return newParams.toString();
	});

	const perf_page_url = createMemo(
		() =>
			`${location.protocol}//${location.hostname}${
				location.port ? `:${location.port}` : ""
			}/perf/${props.project()?.slug}?${perfPlotParams()}`,
	);

	const perf_img_url = createMemo(() => {
		const project_slug = props.project()?.slug;
		if (
			props.isPlotInit() ||
			!(props.share() && project_slug && props.perfQuery())
		) {
			return null;
		}

		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(props.perfQuery())) {
			if (value) {
				searchParams.set(key, value);
			}
		}
		const img_title = title();
		if (img_title) {
			searchParams.set("title", img_title);
		}
		const url = apiUrl(
			props.apiUrl,
			`/v0/projects/${project_slug}/perf/img?${searchParams.toString()}`,
		);
		return url;
	});

	const perfPlotEmbedParams = createMemo(() => {
		const newParams = new URLSearchParams();
		for (const [key, value] of Object.entries(searchParams)) {
			if (value && PERF_PLOT_EMBED_PARAMS.includes(key)) {
				newParams.set(key, value);
			}
		}
		const img_title = title();
		if (img_title) {
			newParams.set(EMBED_TITLE_PARAM, img_title);
		}
		return newParams.toString();
	});

	const perf_embed_url = createMemo(
		() =>
			`${location.protocol}//${location.hostname}${
				location.port ? `:${location.port}` : ""
			}/perf/${props.project()?.slug}/embed?${perfPlotEmbedParams()}`,
	);

	const img_tag = createMemo(
		() =>
			`<a href="${perf_page_url()}"><img src="${perf_img_url()}" title="${
				title() ? title() : props.project()?.name
			}" alt="${title() ? `${title()} for ` : ""}${
				props.project()?.name
			} - Bencher" /></a>`,
	);

	const embed_tag = createMemo(
		() =>
			`<iframe src="${perf_embed_url()}" title="${
				title() ? title() : props.project()?.name
			}" width="100%" height="${embedHeight}px" allow="fullscreen"></iframe>`,
	);

	return (
		<div class={`modal ${props.share() && "is-active"}`}>
			<div
				class="modal-background"
				onClick={(e) => {
					e.preventDefault();
					props.setShare(false);
				}}
				onKeyDown={(e) => {
					e.preventDefault();
					props.setShare(false);
				}}
			/>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Share {props.project()?.name}</p>
					<button
						class="delete"
						type="button"
						aria-label="close"
						onClick={(e) => {
							e.preventDefault();
							props.setShare(false);
						}}
					/>
				</header>
				<section class="modal-card-body">
					<Field
						kind={FieldKind.INPUT}
						fieldKey="title"
						label="Title (optional)"
						value={title()}
						valid={true}
						config={{
							type: "text",
							placeholder: props.project()?.name,
							icon: "fas fa-chart-line",
							validate: (_input: string) => true,
						}}
						handleField={handle_title}
					/>
					<br />
					<Show when={perf_img_url()} fallback={<div>Loading...</div>}>
						<img src={perf_img_url() ?? ""} alt={props.project()?.name ?? ""} />
					</Show>
					<br />
					<br />
					<h4 class="title is-4">
						Click to Copy <code>img</code> Tag
					</h4>
					{/* biome-ignore lint/a11y/useValidAnchor: Copy tag */}
					<a
						style="word-break: break-all;"
						href=""
						onClick={(e) => {
							e.preventDefault();
							navigator.clipboard.writeText(img_tag());
						}}
					>
						<code>{img_tag()}</code>
					</a>
					<br />
					<br />
					<blockquote>🐰 Add me to your README!</blockquote>

					<hr />

					<h4 class="title is-4">Embed Perf Plot</h4>
					<h4 class="subtitle is-4">Click to Copy Embed Tag</h4>
					{/* biome-ignore lint/a11y/useValidAnchor: Copy link */}
					<a
						style="word-break: break-all;"
						href=""
						onClick={(e) => {
							e.preventDefault();
							navigator.clipboard.writeText(embed_tag());
						}}
					>
						{embed_tag()}
					</a>

					<hr />

					<h4 class="title is-4">Click to Copy Public URL</h4>
					{/* biome-ignore lint/a11y/useValidAnchor: Copy link */}
					<a
						style="word-break: break-all;"
						href=""
						onClick={(e) => {
							e.preventDefault();
							navigator.clipboard.writeText(perf_page_url());
						}}
					>
						{perf_page_url()}
					</a>
				</section>

				<footer class="modal-card-foot">
					<button
						class="button is-primary is-fullwidth"
						type="button"
						onClick={(e) => {
							e.preventDefault();
							props.setShare(false);
						}}
					>
						Close
					</button>
				</footer>
			</div>
		</div>
	);
};
