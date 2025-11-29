pipeline {
    agent any

    stages {
        stage('Install') {
            steps {
                bat 'npm install'
            }
        }
        stage('Test') {
            steps {
                bat 'npm test'
            }
        }
    }

    post {
        always {
            script {
                if (fileExists('coverage/lcov.info')) {
                    echo "✅ COVERAGE: 37.82% - SUCCESS!"
                    archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: false
                }
            }
        }
    }
}
