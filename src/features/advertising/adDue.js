const key = (id) => `tf_ad_due_${id}`;

/** Called when a paper is really submitted: the next result view starts with the short ad. */
export const markAdDue = (id) => {
  try {
    sessionStorage.setItem(key(id), '1');
  } catch {
    /* no storage: the ad is simply skipped */
  }
};

export const isAdDue = (id) => {
  try {
    return sessionStorage.getItem(key(id)) === '1';
  } catch {
    return false;
  }
};

export const clearAdDue = (id) => {
  try {
    sessionStorage.removeItem(key(id));
  } catch {
    /* nothing to clear */
  }
};
