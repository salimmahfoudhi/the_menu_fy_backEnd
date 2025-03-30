def getGitBranchName() { 
                return scm.branches[0].name 
            }
def branchName
def targetBranch

pipeline{
    agent any

    environment {
       DOCKERHUB_USERNAME = "taharejeb97"
       DEV_TAG = "${DOCKERHUB_USERNAME}/ordear:v1.6.2-dev"
       STAGING_TAG = "${DOCKERHUB_USERNAME}/ordear:v1.0.5-staging"
       PROD_TAG = "${DOCKERHUB_USERNAME}/ordear:v1.6.2-prod"
       DevOps2024_TAG = "${DOCKERHUB_USERNAME}/ordear:v1.0.0-devops"
       JMETER_VERSION = '5.6.3'
               JMETER_HOME = "/path/to/apache-jmeter-${JMETER_VERSION}"
               PERFORMANCE_JMX = 'Performance.jmx'
  }
     parameters {
       string(name: 'BRANCH_NAME', defaultValue: "${scm.branches[0].name}", description: 'Git branch name')
       string(name: 'CHANGE_ID', defaultValue: '', description: 'Git change ID for merge requests')
       string(name: 'CHANGE_TARGET', defaultValue: '', description: 'Git change ID for the target merge requests')
  }
    stages{

      stage('branch name') {
      steps {
        script {
          branchName = params.BRANCH_NAME
          echo "Current branch name: ${branchName}"
        }
      }
    }

    stage('target branch') {
      steps {
        script {
          targetBranch = branchName
          echo "Target branch name: ${targetBranch}"
        }
      }
    }
        stage('Git Checkout'){
            steps{
                git branch: 'develop', credentialsId: 'git', url: 'https://github.com/ipactconsult/ordear-rest-api.git'
	    }
        }
        
        stage('Clean Build'){
            steps{
                sh 'rm -rf node_modules'
            }
        }

        stage('Install dependencies'){
            steps{
                nodejs('nodeJSInstallationName'){
                    sh 'npm install --legacy-peer-deps'
                    sh 'npm install webpack'
                    
                }
            }
        }

	    
	    
// 	      stage('Unit Testing'){
// 		     steps{
//
// 			    nodejs('nodeJSInstallationName'){
//
// 				    sh 'npm test'
// 			 	    echo "testing"
// 		      }
// 		 }
//
// 	   }
// stage('Unit Tests') {
//             steps {
//                 script {
//                     sh 'npm install'
//
//                     sh 'npm run test:chai'
//                 }
//             }
//         }
//  stage('Coverage Test') {
//             steps {
//                 script {
//                     sh 'npm install'
//
//                     sh 'npm run coverage'
//                 }
//             }
//         }
//         stage('Integration Tests') {
//             steps {
//                 script {
//                     sh 'npm install'
//
//                     sh 'npm run test:jest'
//                 }
//             }
//         }
//         stage('Performance Test') {
//             steps {
//                 script {
//
//                     def workspaceDir = pwd()
//
// //                     sh "wget -P ${workspaceDir} https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz"
// //                     sh "tar -xzf ${workspaceDir}/apache-jmeter-${JMETER_VERSION}.tgz -C ${workspaceDir}"
// sh "npm start &"
//
//             sleep(time: 30, unit: 'SECONDS') // Adjust the sleep time based on your server startup time
//                     sh "chmod +x apache-jmeter-${JMETER_VERSION}/bin/jmeter"
//                     sh "apache-jmeter-${JMETER_VERSION}/bin/jmeter -n -t ${PERFORMANCE_JMX} -l results.jtl"
//
// archiveArtifacts artifacts: 'results.jtl', onlyIfSuccessful: false                }
//             }
//         }
//         stage('Publish Results') {
//             steps {
//                 // Publish performance test results
//                 perfReport percentiles: '0,50,90,95,99',
//                            sourceDataFiles: 'results.jtl'
//             }
//         }

//
// 	 stage('Static Test with Sonar') {
// 		     when {
// 			     expression {
// 				     (params.CHANGE_ID != null) && ((targetBranch == 'develop') || (targetBranch == 'main') || (targetBranch == 'staging') || (targetBranch == 'test_pipeline2')|| (targetBranch == 'devTest'))
// 			     }
// 		    }
// 		     steps{
//
// 			    nodejs('nodeJSInstallationName'){
// 				    sh 'node sonar-project.js'
//
// 			     }
// 		     }
// 	     }


      stage('Build Docker') {
    when {
        expression {
            (params.CHANGE_ID != null) && ((targetBranch == 'develop') || (targetBranch == 'devTest') || (targetBranch == 'main') || (targetBranch == 'staging') || (targetBranch == 'test_pipeline2'))
            }
    }
    steps {
        script {
            if (targetBranch == 'staging') {
                sh "docker build -t ${STAGING_TAG} ."
            } else if (targetBranch == 'develop') {
                sh "docker build -t ${PROD_TAG} ."
            } else if (targetBranch == 'develop') {
                sh "docker build -t ${DEV_TAG} ."
            } else if (targetBranch == 'test_pipeline2') {
                sh "docker build -t ${STAGING_TAG}-test ."
        }
    }
}
      }
    //     stage("Trivy Scan"){
		//	steps	{
//sh"trivy image ${PROD_TAG}" 			}
	//	}
        
        stage('Docker Login'){
          when {
        expression {
          (params.CHANGE_ID != null) && ((targetBranch == 'develop') || (targetBranch == 'devTest') || (targetBranch == 'main') || (targetBranch == 'staging') || (targetBranch == 'test_pipeline2'))
        }
      }
        steps{
            withCredentials([usernamePassword(credentialsId: 'docker', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
            sh "docker login -u ${DOCKERHUB_USERNAME} -p ${DOCKERHUB_PASSWORD}"
            }
        }
        }
        stage('Docker Push'){
          when {
        expression {
          (params.CHANGE_ID != null) && ((targetBranch == 'develop') ||(targetBranch == 'devTest') || (targetBranch == 'main') || (targetBranch == 'staging') || (targetBranch == 'test_pipeline2'))
        }
          }
            steps{
              sh "docker push $DOCKERHUB_USERNAME/ordear --all-tags"
            }
        }

      stage('Remove Containers') {
		when {
        expression {
          (params.CHANGE_ID != null) && ((targetBranch == 'develop') || (targetBranch == 'main') || (targetBranch == 'staging') || (targetBranch == 'test_pipeline2'))
        }
    }
    steps {
        sh '''
        container_ids=$(docker ps -q --filter "publish=4046/tcp")
        if [ -n "$container_ids" ]; then
            echo "Stopping and removing containers..."
            docker stop $container_ids
            docker rm $container_ids
        else
            echo "No containers found using port 4046."
        fi
        '''
    }
}
//
	      stage('Deploy to Prod') {
            when {
                expression {
			(params.CHANGE_ID != null)  && (targetBranch == 'develop')
		}
            }
           steps {
		// sh "docker pull ${PROD_TAG}"

sh "sudo ansible-playbook  ansible/k8s.yml -i ansible/inventory/host.yml --extra-vars='kubectl_tls_verify=false' -vvv"
	   }
	}
//
	    stage('Deploy to Dev') {
      when {
        expression {
          (params.CHANGE_ID != null) && (targetBranch == 'develop')
        }
      }
      steps {
        // sh "docker pull ${DEV_TAG}"
        // sh "docker run -d --name ordear-dev -p 4046:5555 ${DEV_TAG}"
	sh "sudo ansible-playbook -u root ansible/k8s.yml -i ansible/inventory/host.yml"
      }
    }

	    stage('Deploy to Staging') {
      when {
        expression {
          (params.CHANGE_ID != null) && (targetBranch == 'staging')
        }
      }
      steps {
        //sh "docker pull ${STAGING_TAG}"
        //sh "docker run -d --name ordear-staging -p 4046:5555 ${STAGING_TAG}"
	sh "sudo ansible-playbook ansible/k8s.yml -i ansible/inventory/host.yml"
      }
    }

	     stage('Deploy to testpipeline') {
            when {
                expression { 
			(params.CHANGE_ID != null)  && (targetBranch == 'test_pipeline2')
		}
            }
            steps {
		//sh "docker pull ${STAGING_TAG}-test"
                //sh "docker run -d --name ordear-backend -p 4046:5555 ${STAGING_TAG}-test"
		sh "sudo ansible-playbook ansible/k8s.yml -i ansible/inventory/host.yml"
            }
        }
    }
}
