const sonarqubeScanner = require ('sonarqube-scanner');

sonarqubeScanner({
    serverUrl : 'http://185.192.96.18:31265/',
    options : {
        'sonar.projectDescription': 'Ordear Sonar Analysis Backend',
        'sonar.projectName':'ordear-rest-api',
        'sonar.projectKey':'ordear-rest-api',
        'sonar.login':'squ_990e882d5a44a5144bf9a6812e91428985d8386d',
        'sonar.projectVersion':'1.0',
        'sonar.language':'js',
        'sonar.sourceEncoding':'UTF-8',
        'sonar.sources':'.',
    }
},()=>{});
