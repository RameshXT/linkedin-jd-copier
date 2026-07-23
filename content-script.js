(() => {
  console.log('[LinkedIn JD Copier] Content script loaded!');

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful ? Promise.resolve() : Promise.reject(new Error('execCommand returned false'));
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.reject(err);
    }
  };

  const copyText = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => {
        return fallbackCopyTextToClipboard(text);
      });
    } else {
      return fallbackCopyTextToClipboard(text);
    }
  };

  const getJobDetailsContainer = () => {
    const leafNodes = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, span, p, strong'));
    const aboutHeader = leafNodes.find(el => {
      const text = el.textContent ? el.textContent.trim().toLowerCase() : '';
      return text === 'about the job' || text === 'about the role' || text === 'job description';
    });

    if (aboutHeader) {
      let current = aboutHeader.parentNode;
      while (current && current !== document.body) {
        if (current.innerText && current.innerText.trim().length > 200) {
          return current;
        }
        current = current.parentNode;
      }
      return aboutHeader.parentNode;
    }

    return document.querySelector('.scaffold-layout__detail') ||
           document.querySelector('.jobs-search-two-pane__details') || 
           document.querySelector('.jobs-search__job-details--container') || 
           document.querySelector('.jobs-search__job-details') || 
           document.querySelector('.job-view-layout') || 
           document.querySelector('.jobs-description-content__text') || 
           document.getElementById('job-details') ||
           document.querySelector('.jobs-description') ||
           document.querySelector('.show-more-less-html__markup');
  };

  const getCleanJobText = (containerToCopy) => {
    let title = '';
    let company = '';
    let location = '';
    let posted = '';
    let applicants = '';
    let insights = [];
    let description = '';

    const topCard = containerToCopy.querySelector('.jobs-unified-top-card, .job-details-jobs-unified-top-card, [class*="top-card"]') || 
                    document.querySelector('.jobs-unified-top-card, .job-details-jobs-unified-top-card');
                    
    if (topCard) {
      const titleEl = topCard.querySelector('.jobs-unified-top-card__job-title, .job-details-jobs-unified-top-card__job-title, h1, h2');
      if (titleEl) title = titleEl.innerText.trim();

      const companyEl = topCard.querySelector('.jobs-unified-top-card__company-name, [class*="company-name"]');
      if (companyEl) company = companyEl.innerText.trim();

      const primaryDescEl = topCard.querySelector('.jobs-unified-top-card__primary-description, [class*="primary-description"]');
      if (primaryDescEl) {
        const parts = primaryDescEl.innerText.split('·').map(p => p.trim());
        if (parts.length > 0) location = parts[0];
        if (parts.length > 1) posted = parts[1];
        if (parts.length > 2) applicants = parts[2];
      }

      const insightEls = topCard.querySelectorAll('.jobs-unified-top-card__job-insight, [class*="job-insight"]');
      insightEls.forEach(el => {
        const text = el.innerText.trim();
        if (text) {
          insights.push(text.split('\n')[0].trim());
        }
      });
    }

    const descContainer = containerToCopy.querySelector('#job-details, .jobs-description__content, .jobs-description-content__text, .show-more-less-html__markup') ||
                          document.getElementById('job-details') || 
                          document.querySelector('.jobs-description__content');
                          
    if (descContainer) {
      const clone = descContainer.cloneNode(true);
      const btnInClone = clone.querySelector('#yt-inline-copy-btn');
      if (btnInClone) btnInClone.remove();
      description = clone.innerText.trim();
    } else {
      const clone = containerToCopy.cloneNode(true);
      clone.querySelectorAll('button, .artdeco-button, #yt-inline-copy-btn, [role="button"], script, style, .jobs-apply-button--top-card').forEach(el => el.remove());
      description = clone.innerText.trim();
    }

    let output = '';
    
    if (title && company) {
      output += `${title} at ${company}\n`;
      output += `${'='.repeat(title.length + company.length + 4)}\n`;
    } else if (title) {
      output += `${title}\n`;
      output += `${'='.repeat(title.length)}\n`;
    }

    if (location) output += `Location: ${location}\n`;
    if (posted) output += `Posted: ${posted}\n`;
    if (applicants) output += `Applicants: ${applicants}\n`;
    
    if (insights.length > 0) {
      output += `Insights: ${insights.join(' · ')}\n`;
    }

    output += `\n\n`;
    output += description;

    return output.trim();
  };

  const insertCopyButton = () => {
    // 1. Locate the "About the job" heading leaf node on the page
    const leafNodes = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, span, p, strong, div'));
    const aboutHeader = leafNodes.find(el => {
      const text = el.textContent ? el.textContent.trim().toLowerCase() : '';
      return text === 'about the job' || text === 'about the role' || text === 'job description';
    });

    if (!aboutHeader) return;

    // Check if the button is already added in front of this specific header
    const parent = aboutHeader.parentNode;
    if (!parent || parent.querySelector('#yt-inline-copy-btn')) return;

    const containerToCopy = getJobDetailsContainer();
    if (!containerToCopy) return;

    const btn = document.createElement('button');
    btn.id = 'yt-inline-copy-btn';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.gap = '6px';
    btn.style.padding = '6px 16px';
    btn.style.marginBottom = '16px';
    btn.style.fontSize = '14px';
    btn.style.fontWeight = '600';
    btn.style.color = '#ffffff';
    btn.style.backgroundColor = '#0A66C2';
    btn.style.border = 'none';
    btn.style.borderRadius = '16px';
    btn.style.cursor = 'pointer';
    btn.style.width = 'max-content';
    btn.style.alignSelf = 'flex-start';
    btn.style.fontFamily = '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    btn.style.transition = 'transform 100ms';

    const copyIcon = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    `;
    btn.innerHTML = copyIcon + '<span>Copy JD</span>';

    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'scale(0.98)';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'scale(1)';
    });

    btn.addEventListener('click', () => {
      console.log('[LinkedIn JD Copier] Copy button clicked');
      const containerToCopy = getJobDetailsContainer();
      if (!containerToCopy) {
        console.warn('[LinkedIn JD Copier] Job details container not found');
        return;
      }
      
      const elements = Array.from(containerToCopy.querySelectorAll('button, a, span, div, [role="button"]'));
      const showMoreBtns = elements.filter(b => {
        const text = b.textContent ? b.textContent.trim().toLowerCase() : '';
        const aria = b.getAttribute('aria-label')?.toLowerCase() || '';
        const classes = typeof b.className === 'string' ? b.className.toLowerCase() : '';
        
        return text === 'show more' || 
               text === 'see more' || 
               text === '... more' || 
               text === '… more' ||
               text.includes('more description') ||
               aria.includes('see more') || 
               aria.includes('show more') ||
               classes.includes('show-more-less-html__button') ||
               classes.includes('jobs-description__footer-button') ||
               classes.includes('jobs-description__show-more-button');
      });

      console.log('[LinkedIn JD Copier] Clicking show-more buttons:', showMoreBtns.length);
      showMoreBtns.forEach(b => {
        try { b.click(); } catch (err) {}
      });

      const copyAction = () => {
        const textToCopy = getCleanJobText(containerToCopy);

        copyText(textToCopy).then(() => {
          console.log('[LinkedIn JD Copier] Copy successful!');
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg><span>Copied!</span>
          `;
          
          setTimeout(() => {
            btn.innerHTML = copyIcon + '<span>Copy JD</span>';
          }, 2000);
        }).catch(err => {
          console.error('[LinkedIn JD Copier] Failed to copy:', err);
        });
      };

      if (showMoreBtns.length > 0) {
        setTimeout(copyAction, 250);
      } else {
        copyAction();
      }
    });

    // Insert directly before the "About the job" heading
    parent.insertBefore(btn, aboutHeader);
  };

  // Poll DOM to handle SPA rendering cycles
  setInterval(() => {
    insertCopyButton();
  }, 500);
})();
