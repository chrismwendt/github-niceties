const _ = require('lodash')

document.styleSheets[0].addRule(
  ".hide-before:before",
  "display: none !important;"
);

function removeAtAtSigns() {
  document.querySelectorAll("td.blob-code-hunk").forEach(x => {
    x.innerHTML = x.innerHTML.replace(/@@.*@@ /, "");
  });
}

function removePlusMinusSpace() {
  document.querySelectorAll("td.blob-code-hunk").forEach(x => {
    x.classList.add("hide-before");
  });
  document.querySelectorAll("td span.blob-code-marker-context").forEach(x => {
    x.classList.add("hide-before");
  });
  document.querySelectorAll("td span.blob-code-marker-addition").forEach(x => {
    x.classList.add("hide-before");
  });
  document.querySelectorAll("td span.blob-code-marker-deletion").forEach(x => {
    x.classList.add("hide-before");
  });
}

function groupByArray(xs, predicate) {
  const last = a => a[a.length - 1];
  const array = [];
  for (let i = 0; i < xs.length; i++) {
    if (i > 0 && predicate(xs[i - 1], xs[i], i, xs)) {
      last(array).push(xs[i]);
    } else {
      array.push([xs[i]]);
    }
  }
  return array;
}

function dimPartialContext() {
  // remove red/green BGs
  // delete lines without xs
  // dim non x when not deleted
  groupByArray(
    Array.from(
      new Set(
        [...document.querySelectorAll("tr")].filter(
          x =>
            x.querySelector("td.blob-code-deletion") ||
            x.querySelector("td.blob-code-addition")
        )
      )
    ),
    (a, b, i, xs) => b.previousElementSibling === a
  )
    .filter(g => g.some(tr => tr.querySelector(".x")))
    .map(g =>
      g.map(tr => {
        [...tr.children].forEach(td => {
          td.style.backgroundColor = "transparent";
        });
        tr.querySelectorAll(".blob-code-inner>span:not(.x)").forEach(span => {
          span.style.opacity = "0.5";
        });
        return tr;
      })
    );
}

function removeUnexpandables() {
  document.querySelectorAll('tr[data-position="0"]').forEach(x => x.remove())
}

function ignoreWhitespaceOnDiffs() {
  const url = new URL(window.location.href)
  const alreadyIgnoringWhitespace = url.searchParams.get('w') === '1'
  const onDiffPage = [/\/pull\/\d+\/files$/,/\/commit\//].some(r => r.test(url.pathname))
  // can't write this on one line, vs code complains about no expression
  for (const a of document.querySelectorAll('.tabnav-tabs>a')) {
    if (/files$/.test(a.getAttribute('href'))) {
      a.setAttribute('href', a.getAttribute('href') + '?w=1')
    }
  }
  if (!alreadyIgnoringWhitespace && onDiffPage) {
    url.searchParams.set('w', '1')
    window.location.href = url.href
  }
}

function ignoreWhitespaceToggle() {
  window.onkeyup = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;

    // 'w' for whitespace
    if (key === 87 && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      const url = new URL(window.location.href)
      const alreadyIgnoringWhitespace = url.searchParams.get('w') === '1'
      const onDiffPage = [/\/pull\/\d+\/files$/,/\/commit\//].some(r => r.test(url.pathname))
      if (onDiffPage) {
        if (alreadyIgnoringWhitespace) {
          url.searchParams.delete('w')
          window.location.href = url.href
        } else {
          url.searchParams.set('w', '1')
          window.location.href = url.href
        }
      }
    }
  }
}

function switchToMaster() {
  window.onkeyup = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;

    // 'm' for master
    if (key === 77 && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      const url = new URL(window.location.href)
      const alreadyOnMaster = url.pathname.split('/').includes('master')
      if (!alreadyOnMaster) {
        const split = url.pathname.split('/')
        split[4] = 'master'
        url.pathname = split.join('/')
          window.location.href = url.href
      }
    }
  }
}

function main() {
  removeAtAtSigns()
  removePlusMinusSpace()
  // dimPartialContext() // less intuitive than the default
  removeUnexpandables()
  ignoreWhitespaceToggle()
  switchToMaster()
  // ignoreWhitespaceOnDiffs() // too janky, low usefulness
}

window.addEventListener("pjax:end", () => {
  main();
});

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  // document is already ready to go
  main();
} else {
  document.addEventListener("DOMContentLoaded", main);
}
