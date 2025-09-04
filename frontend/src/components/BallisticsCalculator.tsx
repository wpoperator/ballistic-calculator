'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Crosshair, Target, Wind, Cloud, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';

// Validation schema
const formSchema = z.object({
  weapon: z.object({
    sight_height: z.number().min(0.1).max(10.0),
    twist: z.number().min(1.0).max(50.0).optional(),
  }),
  ammo: z.object({
    bc: z.number().min(0.1).max(2.0),
    drag_model: z.enum(['G1', 'G7']),
    muzzle_velocity: z.number().min(500).max(5000),
    bullet_weight: z.number().min(20).max(1000).optional(),
  }),
  atmosphere: z.object({
    temperature: z.number().min(-50).max(150),
    pressure: z.number().min(20.0).max(35.0),
    humidity: z.number().min(0.0).max(1.0),
    altitude: z.number().min(0.0).max(20000),
  }),
  wind: z.object({
    speed: z.number().min(0.0).max(100.0),
    direction: z.number().min(1.0).max(12.0),
  }),
  zero_distance: z.number().min(25.0).max(500.0),
  max_range: z.number().min(100.0).max(3000.0),
  step_size: z.number().min(1.0).max(100.0),
});

type FormData = z.infer<typeof formSchema>;

interface TrajectoryPoint {
  distance: number;
  drop: number;
  windage: number;
  velocity: number;
  energy: number;
  time: number;
  drop_adjustment: number;
  windage_adjustment: number;
}

interface CalculationResponse {
  trajectory: TrajectoryPoint[];
  zero_adjustment: number;
  success: boolean;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function BallisticsCalculator() {
  const [results, setResults] = useState<CalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weapon: {
        sight_height: 2.0,
        twist: 8.0,
      },
      ammo: {
        bc: 0.326,
        drag_model: 'G7',
        muzzle_velocity: 2750,
        bullet_weight: 140,
      },
      atmosphere: {
        temperature: 88,
        pressure: 29.92,
        humidity: 0.7,
        altitude: 0,
      },
      wind: {
        speed: 5,
        direction: 3,
      },
      zero_distance: 100,
      max_range: 1000,
      step_size: 100,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Calculation failed');
      }

      const result: CalculationResponse = await response.json();
      setResults(result);
      
      // Show success toast notification
      toast.success("Calculation complete - Please open the Data tab to view results");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    if (!results?.trajectory) return [];

    return results.trajectory.map((point) => ({
      distance: point.distance,
      drop: point.drop_adjustment,
      windage: point.windage_adjustment,
      velocity: point.velocity,
      energy: point.energy,
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-8">
          <header className="text-center flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Ballistics Calculator (Mil-based)
            </h1>
            <p className="text-muted-foreground">
              Advanced trajectory calculation with milliradian adjustments
            </p>
          </header>
          <div className="ml-4">
            <ThemeToggle />
          </div>
        </div>

        <Tabs defaultValue="inputs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inputs" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2" disabled={!results}>
              <Target className="w-4 h-4" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Weapon Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crosshair className="w-5 h-5" />
                      Weapon Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure weapon-specific parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weapon.sight_height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sight Height (inches)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weapon.twist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barrel Twist (inches)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Ammunition */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Ammunition
                    </CardTitle>
                    <CardDescription>
                      Configure ammunition parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ammo.bc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ballistic Coefficient</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.001"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ammo.drag_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drag Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select drag model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="G1">G1</SelectItem>
                              <SelectItem value="G7">G7</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ammo.muzzle_velocity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Muzzle Velocity (fps)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ammo.bullet_weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bullet Weight (grains)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Atmospheric Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="w-5 h-5" />
                      Atmospheric Conditions
                    </CardTitle>
                    <CardDescription>
                      Configure environmental parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="atmosphere.temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°F)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="atmosphere.pressure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barometric Pressure (inHg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="atmosphere.humidity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Humidity (0-1)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="atmosphere.altitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Altitude (feet)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="10"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Wind Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wind className="w-5 h-5" />
                      Wind Conditions
                    </CardTitle>
                    <CardDescription>
                      Configure wind parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="wind.speed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wind Speed (mph)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="wind.direction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wind Direction (o&apos;clock)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Calculation Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Calculation Settings
                    </CardTitle>
                    <CardDescription>
                      Configure calculation parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="zero_distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zero Distance (yards)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="25"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="max_range"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Range (yards)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="50"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="step_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Step Size (yards)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="text-center">
                  <Button type="submit" disabled={loading} size="lg" className="px-8">
                    {loading ? 'Calculating...' : 'Calculate Trajectory'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {results && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">Zero Adjustment</p>
                        <p className="text-2xl font-bold">
                          {results.zero_adjustment.toFixed(2)} Mils
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">Max Drop</p>
                        <p className="text-2xl font-bold">
                          {Math.max(...results.trajectory.map((p) => Math.abs(p.drop_adjustment))).toFixed(2)} mils
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">Max Windage</p>
                        <p className="text-2xl font-bold">
                          {Math.max(...results.trajectory.map((p) => Math.abs(p.windage_adjustment))).toFixed(2)} mils
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trajectory Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trajectory Chart</CardTitle>
                    <CardDescription>
                      Bullet drop and windage over distance (in mils)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='my-4'>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart 
                        data={formatChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis 
                          dataKey="distance" 
                          label={{ value: 'Distance (yards)', position: 'insideBottom', offset: -15}}
                          className="foreground"
                        />
                        <YAxis 
                          label={{ value: 'Drop (mils)', angle: -90, position: 'insideLeft' }}
                          className="primary"
                        />
                        <Tooltip 
                          formatter={(value, name) => [Number(value).toFixed(2), name]}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        {/* <Legend /> */}
                        <Line
                          type="monotone"
                          dataKey="drop"
                          stroke="#FFF"
                          strokeWidth={2}
                          name="Drop (mils)"
                        />
                        <Line
                          type="monotone"
                          dataKey="windage"
                          stroke="#FFF"
                          strokeWidth={2}
                          name="Windage (mils)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Trajectory Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trajectory Table</CardTitle>
                    <CardDescription>
                      Detailed trajectory data points
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Distance</TableHead>
                            <TableHead>Drop (mils)</TableHead>
                            <TableHead>Windage (mils)</TableHead>
                            <TableHead>Velocity</TableHead>
                            <TableHead>Energy</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.trajectory.map((point, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {point.distance.toFixed(0)} yd
                              </TableCell>
                              <TableCell>{point.drop_adjustment.toFixed(2)} mils</TableCell>
                              <TableCell>{point.windage_adjustment.toFixed(2)} mils</TableCell>
                              <TableCell>{point.velocity.toFixed(0)} fps</TableCell>
                              <TableCell>{point.energy.toFixed(0)} ft-lb</TableCell>
                              <TableCell>{point.time.toFixed(3)} s</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
