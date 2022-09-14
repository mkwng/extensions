import { Icon, MenuBarExtra, open } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { personalAccessToken, preferredEditor } from "./preferences";
import { Codespaces } from "./types";

export default function Command() {
	const { data, isLoading } = useFetch<Codespaces>("https://api.github.com/user/codespaces", {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${personalAccessToken}`,
		},
	});

	if (!data) {
		return null;
	}

	const activeCodespaces = data.codespaces.filter((codespace) => codespace.state === "Available");
	const recentCodespaces = data.codespaces
		.filter((codespace) => codespace.state === "Shutdown")
		.sort((a, b) => new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime())
		.slice(0, 5);

	return (
		<MenuBarExtra
			isLoading={isLoading}
			icon="github@dark.png"
			title={activeCodespaces.length ? `${activeCodespaces.length} active` : undefined}
			tooltip="Active Codespaces"
		>
			<MenuBarExtra.Item title="Active" />
			{activeCodespaces.map((codespace) => (
				<MenuBarExtra.Item
					key={codespace.id}
					icon={{
						source: Icon.Dot,
						tintColor: "green",
					}}
					title={`${codespace.display_name || codespace.name} • ${codespace.repository.owner.login}/${
						codespace.repository.name
					}`}
					onAction={() => {
						if (preferredEditor === "web") {
							open(codespace.web_url);
						} else {
							open(`vscode://github.codespaces/connect?name=${codespace.name}&windowId=_blank`);
						}
					}}
				/>
			))}
			<MenuBarExtra.Item title="Recent" />
			{recentCodespaces.map((codespace) => (
				<MenuBarExtra.Item
					key={codespace.id}
					title={`${codespace.display_name || codespace.name} • ${codespace.repository.owner.login}/${
						codespace.repository.name
					}`}
					icon={{
						source: Icon.Dot,
						tintColor: "grey",
					}}
					onAction={() => {
						if (preferredEditor === "web") {
							open(codespace.web_url);
						} else {
							open(`vscode://github.codespaces/connect?name=${codespace.name}&windowId=_blank`);
						}
					}}
				/>
			))}
		</MenuBarExtra>
	);
}
