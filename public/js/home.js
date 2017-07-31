let form = {
  birthdate: false,
  email: false,
  username: false,
  firstname: false,
  lastname: false,
  password: false,
}

$('#join-us').on('click', () => {
  $('.lead').addClass('hidden');
  $('#home-login').addClass('hidden');
  $('#home-forgot').addClass('hidden');
  $('#home-subscribe').removeClass('hidden');
  $('jumbotron').css('margin-top','3%');
});

$('#members').on('click', () => {
  $('.lead').addClass('hidden');
  $('#home-login').removeClass('hidden');
  $('#home-forgot').addClass('hidden');
  $('#home-subscribe').addClass('hidden');
  $('jumbotron').css('margin-top','6%');
});

$('#signin-forgot').on('click', () => {
  $('.lead').addClass('hidden');
  $('#home-login').addClass('hidden');
  $('#home-forgot').removeClass('hidden');
  $('#home-subscribe').addClass('hidden');
  $('jumbotron').css('margin-top','5%');
});

const birthdateIsOk = () => {
  const currentBirthdate = $('#birthdate').val();
  if (currentBirthdate.length === 10 && checkBirthDate(currentBirthdate)) {
    $('#form-birthdate')
      .removeClass('has-error')
      .addClass('has-success');
    $('.form-sub').removeClass('hidden');
    form.birthdate = true;
    checkForm(form);
  } else {
    $('#form-birthdate')
      .removeClass('has-success')
      .addClass('has-error')
    $('.form-sub').addClass('hidden');
    form.birthdate = false;
  }
  console.log(form);
}

const checkForm = (form) => {
  let count = 0;
  $.map(form, (v, i) => {
    if (value === false) {
      count++;
    }
  });
  if (!count) {
    $('button#signin-button').removeAttr('disabled');
  } else {
    $('button#signin').attr('disabled', true);
  }
}

$('#datetimepicker').datetimepicker({
  format:'L',
  locale: 'fr'
}).on('dp-change', birthdateIsOk);

$('#birthdate').on('keyup', bithdateIsOk);