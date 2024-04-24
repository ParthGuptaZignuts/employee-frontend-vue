export default function generateMenuItems() {
  const userType = localStorage.getItem('type');

  const menuItems = [
    {
      title: 'Home',
      to: { name: 'index' },
      icon: { icon: 'tabler-smart-home' },
    },
    {
      title: 'Employees',
      to: { name: 'employees' },
      icon: { icon: 'tabler-users' },
    },
    {
      title: 'Jobs',
      to: { name: 'jobs' },
      icon: { icon: 'tabler-tie' },
    },
    {
      title: 'Job Applications',
      to:{name:'JobApplication'},
      icon :{icon:'tabler-file-certificate'},
    }
  ];

  if (userType !== 'CA') {
    menuItems.splice(1, 0, {
      title: 'Companies',
      to: { name: 'companies' },
      icon: { icon: 'tabler-layout-dashboard' },
    });
  }

  return menuItems;
}