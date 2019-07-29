export default ({ Tank, Healer, Damage, Maybe, Declined }) => {
    return `
      __Players Going:__
  
      **Tank**
      ${generateRoleMessage(Tank)}
      **Healer**
      ${generateRoleMessage(Healer)}
      **Damage**
      ${generateRoleMessage(Damage)}
  
    __Maybe__
      ${generateRoleMessage(Maybe)}
    __Declined__
    ${generateRoleMessage(Declined)}
    
    Please react to this post with ${RSVP_ACCEPT} to **Accept**, ${RSVP_MAYBE} for **Maybe**, and ${RSVP_DECLINE} to **Decline**.`
}
