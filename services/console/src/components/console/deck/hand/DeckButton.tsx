import {
	Switch,
	type Accessor,
	type Resource,
	Match,
	createResource,
	createMemo,
} from "solid-js";
import type { JsonAuthUser } from "../../../../types/bencher";
import { ActionButton } from "../../../../config/types";
import DeleteButton from "./DeleteButton";
import type { Params } from "astro";

export interface Props {
	apiUrl: string;
	params: Params;
	user: JsonAuthUser;
	config: DeckButtonConfig;
	path: Accessor<string>;
	data: Resource<object>;
}

export interface DeckButtonConfig {
	kind: ActionButton;
	subtitle: string;
	path: (pathname: string, data: object) => string;
	is_allowed?: (apiUrl: string, data: object) => boolean;
	effect?: () => void;
}

const DeckButton = (props: Props) => {
	const allowedFetcher = createMemo(() => {
		return {
			apiUrl: props.apiUrl,
			params: props.params,
		};
	});
	const getAllowed = async (fetcher: {
		apiUrl: string;
		params: Params;
	}) => {
		if (!props.config?.is_allowed) {
			return true;
		}
		return await props.config?.is_allowed(fetcher.apiUrl, fetcher.params);
	};
	const [isAllowed] = createResource(allowedFetcher, getAllowed);

	return (
		<Switch>
			<Match when={props.config?.kind === ActionButton.DELETE && isAllowed()}>
				<div class="columns">
					<div class="column">
						<form
							onSubmit={(e) => {
								e.preventDefault();
							}}
						>
							<div class="field">
								<p class="control">
									<DeleteButton
										apiUrl={props.apiUrl}
										user={props.user}
										path={props.path}
										data={props.data}
										subtitle={props.config.subtitle}
										redirect={props.config.path}
										effect={props.config.effect}
									/>
								</p>
							</div>
						</form>
					</div>
				</div>
			</Match>
		</Switch>
	);
};

export default DeckButton;
