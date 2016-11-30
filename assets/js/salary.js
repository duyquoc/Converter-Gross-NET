var Salary = Salary || {};
Salary = (function() {
  var gross2net = 1,
  languageCode = "vi",
  languageData = {},
  config = {
    income: {
      vnd: 0,
      usd: 1000,
      usd_rate: 22300
    },
    employee_insurance: {
      min_salary: 1300000,
      social: 8,
      health: 1.5,
      unemployment: 1
    },
    employer_insurance: {
      social: 18,
      health: 3,
      unemployment: 1
    },
    deduction: {
      personal: 9000000,
      dependant: 3600000,
      number: 0
    }
  }, params = {
    rate_exchange: 1,
    thousands_sep: 0,
    oEmployeeIncomeTaxDetail: {
      cross: 0,
      net: 0,
      social_insurance: 0,
      health_insurance: 0,
      unemployment_insurance: 0,
      pre_tax_income: 0,
      person_depends_on_the_tax_payer: 0,
      deduction_personal: 0,
      deduction_dependant: 0,
      taxable_income: 0,
      personal_income_tax: 0,
    },
    oEmployerTaxDetail: {
      social_insurance: 0,
      health_insurance: 0,
      unemployment_insurance: 0,
      total: 0
    },
    aEmployeeIncomeTaxLevels: [{
      title: "Đến 5 triệu VND",
      lang: "to-5-million",
      percentage: 5,
      value: 0,
      from: 0,
      to: 5000000,
      maximum: 250000
    }, {
      title: "Từ 5 - 10 triệu VND",
      lang: "upper-5-10-million",
      percentage: 10,
      value: 0,
      from: 5000000,
      to: 10000000,
      maximum: 500000
    }, {
      title: "Từ 10 - 18 triệu VND",
      lang: "upper-10-18-million",
      percentage: 15,
      value: 0,
      from: 10000000,
      to: 18000000,
      maximum: 1200000
    }, {
      title: "Từ 18 - 32 triệu VND",
      lang: "upper-18-32-million",
      percentage: 20,
      value: 0,
      from: 18000000,
      to: 32000000,
      maximum: 2800000
    }, {
      title: "Từ 32 - 52 triệu VND",
      lang: "upper-32-52-million",
      percentage: 25,
      value: 0,
      from: 32000000,
      to: 52000000,
      maximum: 5000000
    }, {
      title: "Từ 52 - 80 triệu VND",
      lang: "upper-52-80-million",
      percentage: 30,
      value: 0,
      from: 52000000,
      to: 80000000,
      maximum: 84000000
    }, {
      title: "Trên 80 triệu VND",
      tkey: "upper-80-million",
      percentage: 35,
      value: 0,
      from: 80000000,
      to: -1
    }],
    aMinWages: [
      {
        title: "Vùng I",
        value: 3500000
      },
      {
        title: "Vùng II",
        value: 3100000
      },
      {
        title: "Vùng III",
        value: 2700000
      },
      {
        title: "Vùng IV",
        value: 2400000
      },
    ],
    aTaxTable: [
      {
        title: "Đến 4,75 triệu",
        from: 0,
        to: 4750000,
        sub: 0,
        div: 0.95
      },
      {
        title: "Từ 4,75 - 9,25 triệu",
        from: 4750000,
        to: 9250000,
        sub: 250000,
        div: 0.9
      },
      {
        title: "Từ 9,25 - 16,05 triệu",
        from: 9250000,
        to: 16050000,
        sub: 750000,
        div: 0.85
      },
      {
        title: "Từ 16,05 - 27,25 triệu",
        from: 16050000,
        to: 27250000,
        sub: 1650000,
        div: 0.8
      },
      {
        title: "Từ 27,25 - 42,25 triệu",
        from: 27250000,
        to: 42250000,
        sub: 3250000,
        div: 0.75
      },
      {
        title: "Từ 42,25 - 61,85 triệu",
        from: 42250000,
        to: 61850000,
        sub: 5850000,
        div: 0.7
      },
      {
        title: "Trên 61,85 triệu ",
        from: 61850000,
        to: -1,
        sub: 9850000,
        div: 0.65
      }
    ]
  };

  var init = function(global) {
    $.extend(config, global);

    initValues();
    handleEvents();
    loadData();
    converter();
    render();
    loadLanguage();
  };

  var initValues = function(){
    $("#vnd").val(config.income.vnd);
    $("#usd").val(config.income.usd);
    $("#usd_rate").val(config.income.usd_rate);
    $("#employee_min_salary").val(config.employee_insurance.min_salary);
    $("#employee_social").val(config.employee_insurance.social);
    $("#employee_health").val(config.employee_insurance.health);
    $("#employee_unemployment").val(config.employee_insurance.unemployment);
    $("#employer_social").val(config.employer_insurance.social);
    $("#employer_health").val(config.employer_insurance.health);
    $("#employer_unemployment").val(config.employer_insurance.unemployment);
    $("#deduction_personal").val(config.deduction.personal);
    $("#deduction_dependant").val(config.deduction.dependant);
  };

  var handleEvents = function(){
    $("button.btn-convert").on("click", function(){
      gross2net = parseInt($(this).data("type"));
      loadData();
      converter();
      render();
    });
    $("button.btn-print").on("click", function(){
      window.print();
    });
    $('input[name=payfor]').on("click", function(){
      if(parseInt($(this).val()) == 1){
        $('input[name=salary_for_insurance]').focus();
      }
    });
    $("#result").on("click", ".btn-vnd", function(){
      params.rate_exchange = 1;
      params.thousands_sep = 0;
      converter();
      render();
      translate({});
    }).on("click", ".btn-usd", function(){
      params.rate_exchange = parseInt($("#usd_rate").val()) || 1;
      params.thousands_sep = 2;
      converter();
      render();
      translate({});
    });
  };

  var rateExchange = function(value){
    if(params.rate_exchange == 1){
      return value;
    }
    return Math.round(value / config.income.usd_rate * 100) / 100;
  };

  var loadData = function(){
    config = {
      income: {
        vnd: parseInt($("#vnd").val()) || 0,
        usd: parseFloat($("#usd").val()) || 0,
        usd_rate: parseFloat($("#usd_rate").val()) || 1
      },
      employee_insurance: {
        min_salary: parseInt($("#employee_min_salary").val()) || 0,
        social: parseFloat($("#employee_social").val()) || 0,
        health: parseFloat($("#employee_health").val()) || 0,
        unemployment: parseFloat($("#employee_unemployment").val()) || 0
      },
      employer_insurance: {
        social: parseFloat($("#employer_social").val()) || 0,
        health: parseFloat($("#employer_health").val()) || 0,
        unemployment: parseFloat($("#employer_unemployment").val()) || 0
      },
      deduction: {
        personal: parseInt($("#deduction_personal").val()) || 0,
        dependant: parseInt($("#deduction_dependant").val()) || 0,
        number: parseInt($("#dependant_number").val()) || 0
      }
    };
    params.config = config;
  };

  var converter = function(){
    var maxInsurance = config.employee_insurance.min_salary * 20;
    salary = config.income.vnd + config.income.usd * config.income.usd_rate,
    dependantTotal = config.deduction.dependant * config.deduction.number,
    personalDeduction = config.deduction.personal,
    insuranceTotal = 0,
    deductionTotal = 0,
    preTaxIncome = 0,
    payfor = $('input[name=payfor]:checked').val() == 0 ? false : true;

    params.oEmployeeIncomeTaxDetail.deduction_personal = personalDeduction;
    params.oEmployeeIncomeTaxDetail.deduction_dependant = dependantTotal;
    deductionTotal = personalDeduction + dependantTotal;

    params.oEmployeeIncomeTaxDetail.taxable_income = 0;
    params.oEmployeeIncomeTaxDetail.personal_income_tax = 0;
    //GROSS - NET
    if(gross2net == 1){
      var insurancePayFor = salary;
      if(payfor){
        insurancePayFor = $('input[name=salary_for_insurance]').val() || 0;
      }else if(salary > maxInsurance){
        insurancePayFor = maxInsurance;
      }
      params.oEmployeeIncomeTaxDetail.cross = salary;
      params.oEmployeeIncomeTaxDetail.social_insurance = insurancePayFor * config.employee_insurance.social / 100;
      params.oEmployeeIncomeTaxDetail.health_insurance = insurancePayFor * config.employee_insurance.health / 100;
      params.oEmployeeIncomeTaxDetail.unemployment_insurance = calculateUnemploymentInsurance(salary, config.employee_insurance.unemployment);

      params.oEmployerTaxDetail.social_insurance = insurancePayFor * config.employer_insurance.social / 100;
      params.oEmployerTaxDetail.health_insurance = insurancePayFor * config.employer_insurance.health / 100;
      params.oEmployerTaxDetail.unemployment_insurance = calculateUnemploymentInsurance(salary, config.employer_insurance.unemployment);
      params.oEmployerTaxDetail.total = params.oEmployeeIncomeTaxDetail.cross + params.oEmployerTaxDetail.social_insurance + params.oEmployerTaxDetail.health_insurance + params.oEmployerTaxDetail.unemployment_insurance;

      insuranceTotal = params.oEmployeeIncomeTaxDetail.social_insurance + params.oEmployeeIncomeTaxDetail.health_insurance + params.oEmployeeIncomeTaxDetail.unemployment_insurance;

      preTaxIncome = salary - insuranceTotal;
      params.oEmployeeIncomeTaxDetail.pre_tax_income = preTaxIncome;

      if(preTaxIncome > deductionTotal){
        var taxableIncome = preTaxIncome - deductionTotal,
        personalIncomeTaxTotal = calculatePersonalIncomeTax(taxableIncome);

        params.oEmployeeIncomeTaxDetail.taxable_income = taxableIncome;
        params.oEmployeeIncomeTaxDetail.personal_income_tax = personalIncomeTaxTotal;
        params.oEmployeeIncomeTaxDetail.net = params.oEmployeeIncomeTaxDetail.cross - insuranceTotal - personalIncomeTaxTotal;
      } else {
        calculatePersonalIncomeTax(0);
        params.oEmployeeIncomeTaxDetail.net = params.oEmployeeIncomeTaxDetail.cross - insuranceTotal;
      }
    } else {
      params.oEmployeeIncomeTaxDetail.net = salary;
      var personalIncomeTaxTotal = 0;
      if(salary > deductionTotal){
        var taxableIncome = calculateTaxableIncome(salary - deductionTotal),
        personalIncomeTaxTotal = calculatePersonalIncomeTax(taxableIncome);

        params.oEmployeeIncomeTaxDetail.taxable_income = taxableIncome;
        params.oEmployeeIncomeTaxDetail.personal_income_tax = personalIncomeTaxTotal;
      } else {
        calculatePersonalIncomeTax(0);
      }
      var preTaxIncome = salary + personalIncomeTaxTotal;
      params.oEmployeeIncomeTaxDetail.pre_tax_income = preTaxIncome;

      var grossSalary = preTaxIncome / (1 - (config.employee_insurance.social+config.employee_insurance.health+config.employee_insurance.unemployment)/100),
      insurancePayFor = grossSalary;
      if(payfor){
        insurancePayFor = $('input[name=salary_for_insurance]').val() || 0;
      }else if(grossSalary > maxInsurance){
        insurancePayFor = maxInsurance;
      }

      params.oEmployeeIncomeTaxDetail.social_insurance = insurancePayFor * config.employee_insurance.social / 100;
      params.oEmployeeIncomeTaxDetail.health_insurance = insurancePayFor * config.employee_insurance.health / 100;
      params.oEmployeeIncomeTaxDetail.unemployment_insurance = grossSalary * config.employee_insurance.health / 100;;

      var grossSalaryExcludeUnemploymentInsurance = preTaxIncome + params.oEmployeeIncomeTaxDetail.social_insurance + params.oEmployeeIncomeTaxDetail.health_insurance,
      grossSalaryIncludeUnemploymentInsurance = grossSalaryExcludeUnemploymentInsurance * 100/(100 - config.employee_insurance.unemployment);
      var unemploymentInsurance = calculateUnemploymentInsurance(grossSalaryIncludeUnemploymentInsurance, config.employee_insurance.unemployment);
      if(unemploymentInsurance < params.oEmployeeIncomeTaxDetail.unemployment_insurance){
        grossSalary = preTaxIncome + params.oEmployeeIncomeTaxDetail.social_insurance + params.oEmployeeIncomeTaxDetail.health_insurance + unemploymentInsurance;
        params.oEmployeeIncomeTaxDetail.unemployment_insurance = calculateUnemploymentInsurance(grossSalary, config.employee_insurance.unemployment);
      }
      grossSalary = preTaxIncome + params.oEmployeeIncomeTaxDetail.social_insurance + params.oEmployeeIncomeTaxDetail.health_insurance + params.oEmployeeIncomeTaxDetail.unemployment_insurance;
      params.oEmployeeIncomeTaxDetail.cross = grossSalary;

      params.oEmployerTaxDetail.social_insurance = insurancePayFor * config.employer_insurance.social / 100;
      params.oEmployerTaxDetail.health_insurance = insurancePayFor * config.employer_insurance.health / 100;
      params.oEmployerTaxDetail.unemployment_insurance = calculateUnemploymentInsurance(grossSalary, config.employer_insurance.unemployment);
      params.oEmployerTaxDetail.total = params.oEmployeeIncomeTaxDetail.cross + params.oEmployerTaxDetail.social_insurance + params.oEmployerTaxDetail.health_insurance + params.oEmployerTaxDetail.unemployment_insurance;
    }
  };

  var calculatePersonalIncomeTax = function(taxIncome){
    var result = 0,
    flag = true;
    _.each(params.aEmployeeIncomeTaxLevels, function(row, idx) {
      var tax = row.to - row.from;
      if(flag){
        if(row.to > 0 && taxIncome > tax){
          taxIncome -= tax;
        } else {
          tax = taxIncome;
          flag = false;
        }
      } else {
        tax = 0;
      }

      row.value = tax * row.percentage / 100;
      result += row.value;
      params.aEmployeeIncomeTaxLevels[idx].value = row.value;
    });
    return result;
  };

  var calculateTaxableIncome = function(salary){
    var result = 0;
    for(var i=0; i<params.aTaxTable.length; i++) {
      var row = params.aTaxTable[i];
      if(row.to >= salary){
        result = (salary - row.sub) / row.div;
        break;
      } else {
        result = (salary - row.sub) / row.div;
      }
    }
    return result;
  };

  var calculateUnemploymentInsurance = function(salary, percent){
    var minWageOption = $('input[name=region]:checked').val(),
    minWage = 0;
    if(minWageOption >= 0 && minWageOption < params.aMinWages.length){
      minWage = params.aMinWages[minWageOption].value * 20 * percent / 100;
    }

    var result = salary * percent / 100;
    if(result > minWage){
      result = minWage;
    }

    return result;
  };

  var translate = function (data){
    if (languageCode == "en"){
      if($.isEmptyObject(languageData)){
        languageData = data;
      }
      $("[data-lang]").each (function (index){
        var str = languageData [$(this).data("lang")];
        $(this).html (str);
      });
      document.title = languageData["document-title"];
    }
  }

  var render = function(){
    var resultTemplate = _.template($("#tpl-result").html());
    $("#result").html(resultTemplate(params));
  };

  var loadLanguage = function(){
    languageCode = window.location.hash.substr (1, 2);
    if (languageCode == "en"){
      $.getJSON("languages/"+languageCode+".json", translate);
      $("#result .btn-usd").trigger("click");
    }
  };

  return {
    init
  };
})();

jQuery(document).ready(function() {
  $.material.init();

  var config = {
    employee_insurance: {
      min_salary: 1300000,
      social: 8,
      health: 1.5,
      unemployment: 1
    },
    employer_insurance: {
      social: 18,
      health: 3,
      unemployment: 1
    },
    deduction: {
      personal: 9000000,
      dependant: 3600000,
      number: 0
    }
  };
  Salary.init(config);
});
