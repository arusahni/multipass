const AMAZON_SITES = [{
  name: 'Amazon Web Services',
  url: 'https://aws.amazon.com',
  tfa: 'Yes',
  sms: 'Yes',
  software: 'Yes',
  hardware: 'Yes',
  doc: 'https://aws.amazon.com/iam/details/mfa/',
  subdomain: 'aws',
}, {
  name: 'Amazon AWS WorkSpaces',
  url: 'https://aws.amazon.com/workspaces/',
  doc: 'https://aws.amazon.com/blogs/aws/multi-factor-auth-for-workspaces/',
  tfa: 'Yes',
  hardware: 'Yes',
  software: 'Yes',
  subdomain: 'aws',
}, {
  name: 'Amazon',
  url: 'https://www.amazon.com',
  tfa: 'Yes',
  software: 'Yes',
  sms: 'Yes',
  exceptions: {
    text: 'SMS or phone call required to enable 2FA. Enabling on Amazon.com activates 2FA on other regional Amazon sites, such as UK and DE.',
  },
  doc: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=201596330',
  subdomain: 'www',
}];

describe('test multipass', () => {
  it('test getPathPrefixMatches', () => {
    const awsSites = AMAZON_SITES.filter(site => site.url.includes('aws'));
    // Verify getting by path prefix will return the a match
    expect(getPathPrefixMatch(awsSites, 'https://aws.amazon.com/workspaces/foo').url).toBe('https://aws.amazon.com/workspaces/');

    // Verify getting by path prefix will return the shortest path if no match exists
    expect(getPathPrefixMatch(awsSites, 'https://us-east-1.signin.aws.amazon.com/oauth').url).toBe('https://aws.amazon.com');
  });

  it('test checkSite', () => {
    const site = { name: 'aws.amazon.com', url: 'https://us-east-1.signin.aws.amazon.com/oauth', username: 'hg-user1' };
    expect(checkSite(site).url).toBe('https://aws.amazon.com');
  });
});
