'use babel';

export default {
  stripTags(str) {
    return str.replace(/(<([^>]+)>)/ig, '');
  },
  setSlug(str) {
    const from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;';
    const to = 'aaaaaeeeeeiiiiooooouuuunc------';
    str = str.replace(/^\s+|\s+$/g, '').toLowerCase();
    for (let i of Array.from(from)) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    return str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }
};
