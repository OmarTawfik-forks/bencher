import { createMemo } from "solid-js";
import { useSearchParams } from "../../util/url";
import { INVITE_PARAM, PLAN_PARAM } from "./auth";

interface Props {
	newUser: boolean;
	githubClientId: string;
}

const OAuthForm = (props: Props) => {
	const [searchParams, _setSearchParams] = useSearchParams();

	const githubPath = createMemo(() => {
		let path = `https://github.com/login/oauth/authorize?client_id=${props.githubClientId}`;
		const invite = searchParams[INVITE_PARAM];
		const plan = searchParams[PLAN_PARAM];
		if (invite) {
			path += `&state=${invite}`;
		} else if (plan) {
			path += `&state=${plan}`;
		}
		return path;
	});

	if (props.githubClientId) {
		return (
			<>
				<div class="is-divider" data-content="OR"></div>
				<a class="button is-fullwidth is-outlined" href={githubPath()}>
					<span class="icon">
						<i class="fab fa-github" aria-hidden="true" />
					</span>
					<span>{props.newUser ? "Sign up" : "Log in"} with GitHub</span>
				</a>
			</>
		);
	} else {
		return <></>;
	}
};

export default OAuthForm;
