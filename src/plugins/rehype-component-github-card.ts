import type { Element } from "hast";
import { h } from "hastscript";
import type { RootContent } from "mdast";

interface GithubCardProperties {
	repo: string;
}

/**
 * Creates a GitHub Card component.
 *
 * @param properties - The properties of the component.
 * @param properties.repo - The GitHub repository in the format "owner/repo".
 * @param children - The children elements of the component.
 * @returns The created GitHub Card component.
 */
export function GithubCardComponent(
	properties: GithubCardProperties,
	children: RootContent[],
): Element {
	if (Array.isArray(children) && children.length !== 0) {
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("github" directive must be leaf type "::github{repo="owner/repo"}")',
		]);
	}

	if (!properties.repo || !properties.repo.includes("/")) {
		return h(
			"div",
			{ class: "hidden" },
			'Invalid repository. ("repo" attribute must be in the format "owner/repo")',
		);
	}

	const { repo } = properties;
	const cardUuid = `GC${Math.random().toString(36).slice(-6)}`; // Collisions are not important

	const clientScript = `
(function() {
  const cardId = ${JSON.stringify(cardUuid)};
  const repoName = ${JSON.stringify(repo)};
  const card = document.getElementById(cardId + '-card');

  if (!card) return;

  function setHtml(selector, value) {
    const el = card.querySelector(selector);
    if (el) el.innerHTML = value;
  }

  function setBgImage(selector, url) {
    const el = card.querySelector(selector);
    if (el && url) {
      el.style.backgroundImage = 'url(' + url + ')';
      el.style.backgroundColor = 'transparent';
    }
  }

  function formatNumber(num) {
    return Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(num).replaceAll("\\u202f", '');
  }

  fetch('https://api.github.com/repos/' + repoName, { referrerPolicy: "no-referrer" })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      setHtml('#' + cardId + '-description', data.description?.replace(/:[a-zA-Z0-9_]+:/g, '') || "Description not set");
      setHtml('#' + cardId + '-language', data.language || 'N/A');
      setHtml('#' + cardId + '-forks', formatNumber(data.forks));
      setHtml('#' + cardId + '-stars', formatNumber(data.stargazers_count));
      setHtml('#' + cardId + '-license', data.license?.spdx_id || "no-license");
      setBgImage('#' + cardId + '-avatar', data.owner?.avatar_url);
      
      card.classList.remove("fetch-waiting");
      console.log("[GITHUB-CARD] Loaded card for " + repoName + " | " + cardId);
    })
    .catch(err => {
      card.classList.add("fetch-error");
      console.warn("[GITHUB-CARD] (Error) Loading card for " + repoName + " | " + cardId, err);
    });
})();
  `;

	const nAvatar = h(`div#${cardUuid}-avatar`, { class: "gc-avatar" });
	const nLanguage = h(
		`span#${cardUuid}-language`,
		{ class: "gc-language" },
		"Waiting...",
	);

	const nTitle = h("div", { class: "gc-titlebar" }, [
		h("div", { class: "gc-titlebar-left" }, [
			h("div", { class: "gc-owner" }, [
				nAvatar,
				h("div", { class: "gc-user" }, repo.split("/")[0]),
			]),
			h("div", { class: "gc-divider" }, "/"),
			h("div", { class: "gc-repo" }, repo.split("/")[1]),
		]),
		h("div", { class: "github-logo" }),
	]);

	const nDescription = h(
		`div#${cardUuid}-description`,
		{ class: "gc-description" },
		"Waiting for api.github.com...",
	);

	const nStars = h(`div#${cardUuid}-stars`, { class: "gc-stars" }, "00K");
	const nForks = h(`div#${cardUuid}-forks`, { class: "gc-forks" }, "0K");
	const nLicense = h(`div#${cardUuid}-license`, { class: "gc-license" }, "0K");

	return h(
		`a#${cardUuid}-card`,
		{
			class: "card-github fetch-waiting no-styling",
			href: `https://github.com/${repo}`,
			target: "_blank",
			rel: "noopener noreferrer",
			repo,
		},
		[
			nTitle,
			nDescription,
			h("div", { class: "gc-infobar" }, [nStars, nForks, nLicense, nLanguage]),
			h("script", { type: "text/javascript", defer: true }, clientScript),
		],
	);
}
