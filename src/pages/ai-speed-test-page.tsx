import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Clock, Zap, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface AIModel {
  id: string;
  name: string;
}

interface TestResult {
  id: string;
  modelName: string;
  apiUrl: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  responseSize?: number;
  statusCode?: number;
}

interface SpeedTestConfig {
  apiUrl: string;
  apiKey: string;
  modelName: string;
  testPrompt: string;
  testCount: number;
  concurrentCount: number;
}

export default function AISpeedTestPage() {
  const [config, setConfig] = useState<SpeedTestConfig>({
    apiUrl: "",
    apiKey: "",
    modelName: "",
    testPrompt: "请简单回复'测试成功'",
    testCount: 5,
    concurrentCount: 1,
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [statistics, setStatistics] = useState({
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    averageResponseTime: 0,
    minResponseTime: 0,
    maxResponseTime: 0,
    totalResponseTime: 0,
  });

  // 从localStorage加载配置
  useEffect(() => {
    const apiUrl = localStorage.getItem("ai_api_url") || "";
    const apiKey = localStorage.getItem("ai_api_key") || "";
    const selectedModelId = localStorage.getItem("tg_selected_model");
    const savedModels = localStorage.getItem("ai_models");
    
    let modelName = "";
    if (selectedModelId && savedModels) {
      const models = JSON.parse(savedModels) as AIModel[];
      const selectedModel = models.find(model => model.id === selectedModelId);
      if (selectedModel) {
        modelName = selectedModel.name;
      }
    }

    setConfig(prev => ({
      ...prev,
      apiUrl,
      apiKey,
      modelName,
    }));
  }, []);

  // 保存配置到localStorage
  // const saveConfig = () => {
  //   localStorage.setItem("ai_api_url", config.apiUrl);
  //   localStorage.setItem("ai_api_key", config.apiKey);
  //   toast("配置已保存");
  // };

  // 执行单个测试
  const runSingleTest = async (testId: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.modelName,
          messages: [
            {
              role: "user",
              content: config.testPrompt,
            },
          ],
        }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const responseSize = JSON.stringify(data).length;

      return {
        id: testId,
        modelName: config.modelName,
        apiUrl: config.apiUrl,
        startTime,
        endTime,
        duration,
        success: true,
        responseSize,
        statusCode: response.status,
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return {
        id: testId,
        modelName: config.modelName,
        apiUrl: config.apiUrl,
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  };

  // 执行并发测试
  const runConcurrentTests = async (count: number): Promise<TestResult[]> => {
    const testPromises = Array.from({ length: count }, (_, index) => 
      runSingleTest(`test-${Date.now()}-${index}`)
    );
    return Promise.all(testPromises);
  };

  // 开始测试
  const startTest = async () => {
    if (!config.apiUrl || !config.apiKey || !config.modelName) {
      toast("请填写完整的配置信息", {
        description: "API地址、API密钥和模型名称都是必需的",
      });
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    
    const allResults: TestResult[] = [];
    const totalTests = config.testCount;
    const concurrentCount = config.concurrentCount;
    
    try {
      // 分批执行测试
      for (let i = 0; i < totalTests; i += concurrentCount) {
        const batchSize = Math.min(concurrentCount, totalTests - i);
        const batchResults = await runConcurrentTests(batchSize);
        allResults.push(...batchResults);
        
        // 实时更新结果
        setTestResults([...allResults]);
        
        // 添加小延迟避免过于频繁的请求
        if (i + concurrentCount < totalTests) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error("测试执行失败:", error);
      toast("测试执行失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 计算统计数据
  useEffect(() => {
    if (testResults.length === 0) {
      setStatistics({
        totalTests: 0,
        successfulTests: 0,
        failedTests: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        totalResponseTime: 0,
      });
      return;
    }

    const successfulTests = testResults.filter(r => r.success);
    const failedTests = testResults.filter(r => !r.success);
    const responseTimes = successfulTests.map(r => r.duration);
    
    const totalResponseTime = responseTimes.reduce((sum, time) => sum + time, 0);
    const averageResponseTime = responseTimes.length > 0 ? totalResponseTime / responseTimes.length : 0;
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    setStatistics({
      totalTests: testResults.length,
      successfulTests: successfulTests.length,
      failedTests: failedTests.length,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      totalResponseTime,
    });
  }, [testResults]);

  // 清除测试结果
  const clearResults = () => {
    setTestResults([]);
    setStatistics({
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      totalResponseTime: 0,
    });
  };

  // 导出测试结果
  const exportResults = () => {
    const data = {
      config,
      testResults,
      statistics,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-speed-test-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast("测试结果已导出");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">AI模型接口速率测试</h1>
          <p className="text-muted-foreground">测试大模型API的响应速度和稳定性</p>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">测试配置</TabsTrigger>
            <TabsTrigger value="results">测试结果</TabsTrigger>
            <TabsTrigger value="statistics">统计分析</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>测试配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiUrl">API地址</Label>
                    <Input
                      id="apiUrl"
                      value={config.apiUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                      placeholder="https://api.openai.com/v1/chat/completions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API密钥</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="sk-..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelName">模型名称</Label>
                    <Input
                      id="modelName"
                      value={config.modelName}
                      onChange={(e) => setConfig(prev => ({ ...prev, modelName: e.target.value }))}
                      placeholder="gpt-3.5-turbo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testCount">测试次数</Label>
                    <Input
                      id="testCount"
                      type="number"
                      min="1"
                      max="100"
                      value={config.testCount}
                      onChange={(e) => setConfig(prev => ({ ...prev, testCount: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="concurrentCount">并发数</Label>
                    <Input
                      id="concurrentCount"
                      type="number"
                      min="1"
                      max="10"
                      value={config.concurrentCount}
                      onChange={(e) => setConfig(prev => ({ ...prev, concurrentCount: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testPrompt">测试提示词</Label>
                  <Input
                    id="testPrompt"
                    value={config.testPrompt}
                    onChange={(e) => setConfig(prev => ({ ...prev, testPrompt: e.target.value }))}
                    placeholder="请输入测试用的提示词"
                  />
                </div>

                <div className="flex gap-2">
                  {/* <Button onClick={saveConfig} variant="outline">
                    保存配置
                  </Button> */}
                  <Button 
                    onClick={startTest} 
                    disabled={isTesting}
                    className="flex-1"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        测试中...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        开始测试
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>测试结果</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={clearResults} variant="outline" size="sm">
                      清除结果
                    </Button>
                    <Button onClick={exportResults} variant="outline" size="sm">
                      导出结果
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无测试结果，请先执行测试
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">{result.modelName}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(result.startTime).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{result.duration}ms</div>
                            <div className="text-sm text-muted-foreground">
                              {result.success ? "成功" : "失败"}
                            </div>
                          </div>
                          {result.success && result.responseSize && (
                            <Badge variant="outline">
                              {result.responseSize} 字符
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>统计分析</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics.totalTests === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无统计数据，请先执行测试
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{statistics.totalTests}</div>
                        <div className="text-sm text-muted-foreground">总测试数</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{statistics.successfulTests}</div>
                        <div className="text-sm text-muted-foreground">成功次数</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{statistics.failedTests}</div>
                        <div className="text-sm text-muted-foreground">失败次数</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {statistics.totalTests > 0 ? ((statistics.successfulTests / statistics.totalTests) * 100).toFixed(1) : 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">成功率</div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <div className="text-xl font-bold">{statistics.averageResponseTime.toFixed(0)}ms</div>
                        <div className="text-sm text-muted-foreground">平均响应时间</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <div className="text-xl font-bold">{statistics.minResponseTime}ms</div>
                        <div className="text-sm text-muted-foreground">最快响应时间</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                        <div className="text-xl font-bold">{statistics.maxResponseTime}ms</div>
                        <div className="text-sm text-muted-foreground">最慢响应时间</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 