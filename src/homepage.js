

const renderHome = (req, res) => {
  // addFixures(res);

  res.render('home', {
    isNotHome: false,
    title: 'Matcha- Home',
    bodyPage: 'home-body',
  });
}

export default {
  renderHome,
  
}