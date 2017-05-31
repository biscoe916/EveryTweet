export function getUserName() {
  try {
    return JSON.parse($('#init-data').val()).profile_user.screen_name;
  } catch(e) {
    alert('Error, we couldn\'t get the user\'s name. Are you sure you\'re on user page?');
    throw new Error('User not found');
  }
}