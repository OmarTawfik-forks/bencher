import type { Params } from "astro";
import { type Accessor, Match, type Resource, Switch } from "solid-js";
import { Button } from "../../../../config/types";
import type { JsonAuthUser } from "../../../../types/bencher";
import { BACK_PARAM, encodePath, pathname } from "../../../../util/url";
import ConsoleButton from "./ConsoleButton";
import PerfButton from "./PerfButton";
import StatusButton from "./StatusButton";

export interface Props {
	isConsole: boolean;
	apiUrl: string;
	params: Params;
	user: JsonAuthUser;
	button: DeckHeaderButtonConfig;
	path: Accessor<string>;
	data: Resource<Record<string, any>>;
	title: Accessor<string | number | undefined>;
	handleRefresh: () => void;
}

export interface DeckHeaderButtonConfig {
	kind: Button;
	path?: (pathname: string) => string;
}

const DeckHeaderButton = (props: Props) => {
	return (
		<Switch>
			<Match when={props.button.kind === Button.EDIT}>
				<a
					class="button is-fullwidth"
					title={`Edit ${props.title()}`}
					href={`${
						props.button?.path?.(pathname()) ?? "#"
					}?${BACK_PARAM}=${encodePath()}`}
				>
					<span class="icon">
						<i class="fas fa-pen" />
					</span>
					<span>Edit</span>
				</a>
			</Match>
			<Match when={props.button.kind === Button.STATUS}>
				<StatusButton
					apiUrl={props.apiUrl}
					user={props.user}
					path={props.path}
					data={props.data}
					handleRefresh={props.handleRefresh}
				/>
			</Match>
			<Match when={props.button.kind === Button.CONSOLE}>
				<ConsoleButton
					params={props.params}
					resource={props.button.resource}
					param={props.button.param}
				/>
			</Match>
			<Match when={props.button.kind === Button.PERF}>
				<PerfButton
					isConsole={props.isConsole}
					params={props.params}
					data={props.data}
				/>
			</Match>
			<Match when={props.button.kind === Button.REFRESH}>
				<button
					class="button is-fullwidth"
					type="button"
					title={`Refresh ${props.title()}`}
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
			</Match>
		</Switch>
	);
};

export default DeckHeaderButton;
